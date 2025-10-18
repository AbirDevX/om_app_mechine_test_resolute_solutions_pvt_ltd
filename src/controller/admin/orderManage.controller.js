const mongoose = require('mongoose');
const Order = require('../../schema/Order');
const OrderItem = require('../../schema/OrderItems');
const Payment = require('../../schema/Payment');
const User = require('../../schema/User');
const { HttpException } = require("../../utility/exception/httpException");

// GET /admin/orders → (Admin Only) Get paginated and filterable list of all orders
exports.getAllOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status = 'all',
            userId,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search = ''
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        // Build filter conditions
        const filterConditions = {
            isDeleted: 0
        };

        // Filter by order status
        if (status !== 'all') {
            filterConditions.orderStatus = status;
        }

        // Filter by specific user
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            filterConditions.userId = new mongoose.Types.ObjectId(userId);
        }

        // Date range filter
        if (startDate || endDate) {
            filterConditions.createdAt = {};
            if (startDate) {
                filterConditions.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filterConditions.createdAt.$lte = new Date(endDate);
            }
        }

        // Build aggregation pipeline for complex filtering
        const aggregationPipeline = [
            { $match: filterConditions },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                email: 1,
                                mobile: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'payment',
                    pipeline: [
                        {
                            $project: {
                                transactionId: 1,
                                status: 1,
                                paymentMethod: 1,
                                paidAt: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'orderItems',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'items',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'productId',
                                foreignField: '_id',
                                as: 'product',
                                pipeline: [
                                    {
                                        $project: {
                                            name: 1,
                                            price: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $project: {
                                quantity: 1,
                                priceAtPurchase: 1,
                                product: { $arrayElemAt: ['$product', 0] }
                            }
                        }
                    ]
                }
            }
        ];

        // Add search filter if provided
        if (search && search.trim()) {
            aggregationPipeline.unshift({
                $match: {
                    $or: [
                        { 'user.fullName': { $regex: search.trim(), $options: 'i' } },
                        { 'user.email': { $regex: search.trim(), $options: 'i' } },
                        { notes: { $regex: search.trim(), $options: 'i' } }
                    ]
                }
            });
        }

        // Add sorting
        const sortObj = {};
        const allowedSortFields = ['createdAt', 'updatedAt', 'totalAmount', 'orderStatus'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        sortObj[sortField] = sortOrder === 'desc' ? -1 : 1;

        // Execute aggregation with facet for pagination
        const result = await Order.aggregate([
            ...aggregationPipeline,
            {
                $facet: {
                    orders: [
                        { $sort: sortObj },
                        { $skip: offset },
                        { $limit: limitNum }
                    ],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ]);

        const orders = result[0].orders;
        const totalCount = result[0].totalCount[0]?.count || 0;

        // Format orders for response
        const formattedOrders = orders.map(order => ({
            id: order._id,
            orderStatus: order.orderStatus,
            totalAmount: parseFloat(order.totalAmount.toString()),
            notes: order.notes,
            user: {
                id: order.userId,
                name: order.user[0]?.fullName || 'Unknown',
                email: order.user[0]?.email || 'Unknown',
                mobile: order.user[0]?.mobile || 'N/A'
            },
            itemsCount: order.items.length,
            items: order.items.map(item => ({
                product: {
                    name: item.product?.name || 'Deleted Product',
                    originalPrice: item.product ? parseFloat(item.product.price.toString()) : 0
                },
                quantity: item.quantity,
                priceAtPurchase: parseFloat(item.priceAtPurchase.toString()),
                totalPrice: item.quantity * parseFloat(item.priceAtPurchase.toString())
            })),
            payment: order.payment[0] ? {
                transactionId: order.payment[0].transactionId,
                status: order.payment[0].status,
                paymentMethod: order.payment[0].paymentMethod,
                paidAt: order.payment[0].paidAt
            } : null,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        }));

        const totalPages = Math.ceil(totalCount / limitNum);

        // Get order statistics
        const orderStats = await Order.aggregate([
            { $match: { isDeleted: 0 } },
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: { $toDouble: '$totalAmount' } }
                }
            }
        ]);

        const stats = {
            total: totalCount,
            byStatus: orderStats.reduce((acc, stat) => {
                acc[stat._id] = {
                    count: stat.count,
                    revenue: stat.totalRevenue
                };
                return acc;
            }, {}),
            totalRevenue: orderStats.reduce((sum, stat) => sum + stat.totalRevenue, 0)
        };

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            status_code: 200,
            admin: {
                id: req.user.sub,
                name: req.user.fullName
            },
            pagination: {
                total: totalCount,
                totalPages: totalPages,
                currentPage: pageNum,
                perPage: limitNum,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            },
            filters: {
                status,
                userId,
                startDate,
                endDate,
                search,
                sortBy: sortField,
                sortOrder
            },
            statistics: stats,
            data: formattedOrders
        });

    } catch (error) {

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};

// PATCH /admin/orders/:id/status → (Admin Only) Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id: orderId } = req.params;
        const { status, notes = '' } = req.body;
        const adminId = req.user.sub;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            throw new HttpException(400, "Invalid order ID format");
        }

        // Find order
        const order = await Order.findOne({
            _id: orderId,
            isDeleted: 0
        }).populate('userId', 'fullName email');

        if (!order) {
            throw new HttpException(404, "Order not found");
        }

        // Validate status transition
        const currentStatus = order.orderStatus;
        const newStatus = status;

        // Business rules for status transitions
        const allowedTransitions = {
            'PENDING_PAYMENT': ['PAID', 'CANCELLED'],
            'PAID': ['SHIPPED', 'CANCELLED'],
            'SHIPPED': ['OUT_FOR_DELIVERY', 'DELIVERED'],
            'OUT_FOR_DELIVERY': ['DELIVERED'],
            'DELIVERED': [], // Final status
            'CANCELLED': [] // Final status
        };

        if (!allowedTransitions[currentStatus]) {
            throw new HttpException(400, `Invalid current order status: ${currentStatus}`);
        }

        if (!allowedTransitions[currentStatus].includes(newStatus)) {
            throw new HttpException(400,
                `Cannot change order status from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions[currentStatus].join(', ')}`
            );
        }

        // Update order status
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                orderStatus: newStatus,
                notes: notes ? `${order.notes || ''}\n[${new Date().toISOString()}] Admin: ${notes}`.trim() : order.notes,
                updatedAt: new Date()
            },
            { new: true }
        ).populate('userId', 'fullName email');

        // Get order items for response
        const orderItems = await OrderItem.find({ orderId: orderId })
            .populate('productId', 'name')
            .lean();

        // Get payment details
        const payment = await Payment.findOne({ orderId: orderId }).lean();

        // TODO: Send notification email to customer about status update
        console.log(`Order ${orderId} status updated to ${newStatus}. Notify customer: ${order.userId.email}`);

        const responseData = {
            id: updatedOrder._id,
            orderStatus: updatedOrder.orderStatus,
            totalAmount: parseFloat(updatedOrder.totalAmount.toString()),
            notes: updatedOrder.notes,
            customer: {
                id: updatedOrder.userId._id,
                name: updatedOrder.userId.fullName,
                email: updatedOrder.userId.email
            },
            items: orderItems.map(item => ({
                product: {
                    name: item.productId?.name || 'Deleted Product'
                },
                quantity: item.quantity,
                priceAtPurchase: parseFloat(item.priceAtPurchase.toString())
            })),
            payment: payment ? {
                transactionId: payment.transactionId,
                status: payment.status,
                paymentMethod: payment.paymentMethod,
                paidAt: payment.paidAt
            } : null,
            statusHistory: {
                previousStatus: currentStatus,
                newStatus: newStatus,
                updatedBy: adminId,
                updatedAt: updatedOrder.updatedAt
            },
            createdAt: updatedOrder.createdAt,
            updatedAt: updatedOrder.updatedAt
        };

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${newStatus} successfully`,
            status_code: 200,
            admin: {
                id: adminId,
                name: req.user.fullName
            },
            data: responseData
        });

    } catch (error) {

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};

// GET /admin/orders/:id → (Admin Only) Get detailed order information
exports.getOrderById = async (req, res) => {
    try {
        const { id: orderId } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            throw new HttpException(400, "Invalid order ID format");
        }

        // Get detailed order information
        const orderData = await Order.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(orderId), isDeleted: 0 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                email: 1,
                                mobile: 1,
                                createdAt: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'payment'
                }
            },
            {
                $lookup: {
                    from: 'orderItems',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'items',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'productId',
                                foreignField: '_id',
                                as: 'product'
                            }
                        },
                        {
                            $project: {
                                quantity: 1,
                                priceAtPurchase: 1,
                                product: { $arrayElemAt: ['$product', 0] }
                            }
                        }
                    ]
                }
            }
        ]);

        if (!orderData || orderData.length === 0) {
            throw new HttpException(404, "Order not found");
        }

        const order = orderData[0];

        const detailedOrder = {
            id: order._id,
            orderStatus: order.orderStatus,
            totalAmount: parseFloat(order.totalAmount.toString()),
            notes: order.notes,
            customer: {
                id: order.user[0]._id,
                name: order.user[0].fullName,
                email: order.user[0].email,
                mobile: order.user[0].mobile,
                customerSince: order.user[0].createdAt
            },
            items: order?.items?.map(item => ({
                id: item._id,
                product: {
                    id: item.product?._id,
                    name: item.product?.name || 'Deleted Product',
                    currentPrice: item.product ? parseFloat(item.product.price.toString()) : null,
                    description: item.product?.description
                },
                quantity: item.quantity,
                priceAtPurchase: parseFloat(item.priceAtPurchase.toString()),
                totalPrice: item.quantity * parseFloat(item.priceAtPurchase.toString()),
                priceDifference: item.product ?
                    parseFloat(item.product.price.toString()) - parseFloat(item.priceAtPurchase.toString()) : 0
            })),
            payment: order.payment[0] ? {
                id: order.payment[0]._id,
                transactionId: order.payment[0].transactionId,
                amount: parseFloat(order.payment[0].amount.toString()),
                status: order.payment[0].status,
                paymentMethod: order.payment[0].paymentMethod,
                paidAt: order.payment[0].paidAt,
                expiresAt: order.payment[0].expiresAt
            } : null,
            timeline: [
                { status: 'PENDING_PAYMENT', timestamp: order.createdAt, completed: true },
                { status: 'PAID', timestamp: order.payment[0]?.paidAt, completed: !!order.payment[0]?.paidAt },
                { status: 'SHIPPED', timestamp: null, completed: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus) },
                { status: 'OUT_FOR_DELIVERY', timestamp: null, completed: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus) },
                { status: 'DELIVERED', timestamp: null, completed: order.orderStatus === 'DELIVERED' }
            ],
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };

        return res.status(200).json({
            success: true,
            message: "Order details fetched successfully",
            status_code: 200,
            admin: {
                id: req.user.sub,
                name: req.user.fullName
            },
            data: detailedOrder
        });

    } catch (error) {

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};
