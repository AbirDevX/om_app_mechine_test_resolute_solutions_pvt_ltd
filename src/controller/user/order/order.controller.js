const mongoose = require('mongoose');
const Order = require('../../../schema/Order');
const OrderItem = require('../../../schema/OrderItems');
const Payment = require('../../../schema/Payment');
const Cart = require('../../../schema/Cart');
const CartItem = require('../../../schema/CartItem');
const Product = require('../../../schema/Product');
const { HttpException } = require("../../../utility/exception/httpException");

// POST /orders/checkout → Alternative approach without ordered: true
exports.checkout = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        await session.startTransaction();

        const userId = req.user.sub;
        const { notes = '' } = req.body;

        // Find user's active cart
        const cart = await Cart.findOne({
            userId: userId,
            status: 1
        }).session(session);

        if (!cart) {
            throw new HttpException(400, "No active cart found");
        }

        // Get cart items with product details
        const cartItems = await CartItem.find({ cartId: cart._id })
            .populate('productId')
            .session(session);

        if (!cartItems || cartItems.length === 0) {
            throw new HttpException(400, "Cart is empty");
        }

        let totalAmount = 0;
        const stockUpdates = [];
        const orderItemsData = [];

        // Validate stock and prepare order items
        for (const cartItem of cartItems) {
            const product = cartItem.productId;

            // Check if product exists and is active
            if (!product || product.status !== 1 || product.isDeleted === 1) {
                throw new HttpException(400, `Product "${product?.name || 'Unknown'}" is no longer available`);
            }

            const availableStock = product.totalStock - product.reservedStock;

            // Check stock availability
            if (availableStock < cartItem.quantity) {
                throw new HttpException(400,
                    `Insufficient stock for "${product.name}". Available: ${availableStock}, Requested: ${cartItem.quantity}`
                );
            }

            // Reserve stock (increase reservedStock)
            stockUpdates.push({
                productId: product._id,
                quantity: cartItem.quantity
            });

            // Prepare order item data
            orderItemsData.push({
                productId: product._id,
                quantity: cartItem.quantity,
                priceAtPurchase: product.price
            });

            // Calculate total
            totalAmount += cartItem.quantity * parseFloat(product.price.toString());
        }

        const orderData = {
            userId: userId,
            totalAmount: mongoose.Types.Decimal128.fromString(totalAmount.toFixed(2)),
            orderStatus: 'PENDING_PAYMENT',
            notes: notes.trim(),
            isDeleted: 0
        };

        const newOrder = new Order(orderData);
        await newOrder.save({ session });

        const createdOrderItems = [];
        for (const itemData of orderItemsData) {
            const orderItem = new OrderItem({
                ...itemData,
                orderId: newOrder._id
            });
            await orderItem.save({ session });
            createdOrderItems.push(orderItem);
        }

        // Reserve stock for all products
        for (const update of stockUpdates) {
            await Product.findByIdAndUpdate(
                update.productId,
                {
                    $inc: { reservedStock: update.quantity }
                },
                { session }
            );
        }

        const paymentData = {
            orderId: newOrder._id,
            amount: mongoose.Types.Decimal128.fromString(totalAmount.toFixed(2)),
            status: 0, // pending
            paymentMethod: 'mock',
            gatewayResponse: {},
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        };

        const payment = new Payment(paymentData);
        await payment.save({ session });

        // Clear cart after successful order creation
        await CartItem.deleteMany({ cartId: cart._id }, { session });
        cart.status = 2; // converted
        await cart.save({ session });

        await session.commitTransaction();

        // Prepare response data
        const responseOrder = {
            id: newOrder._id,
            totalAmount: totalAmount,
            orderStatus: newOrder.orderStatus,
            notes: newOrder.notes,
            items: createdOrderItems.map(item => ({
                id: item._id,
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: parseFloat(item.priceAtPurchase.toString()),
                totalPrice: item.quantity * parseFloat(item.priceAtPurchase.toString())
            })),
            payment: {
                id: payment._id,
                status: payment.status,
                paymentMethod: payment.paymentMethod,
                expiresAt: payment.expiresAt
            },
            createdAt: newOrder.createdAt
        };

        return res.status(201).json({
            success: true,
            message: "Order created successfully. Please complete payment within 15 minutes.",
            status_code: 201,
            user: {
                id: userId,
                name: req.user.fullName
            },
            data: responseOrder
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Checkout error:', error);

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    } finally {
        await session.endSession();
    }
};

// POST /orders/:id/pay → (User Only) Mock payment endpoint
exports.processPayment = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        await session.startTransaction();

        const userId = req.user.sub;
        const { id: orderId } = req.params;
        const { paymentMethod = 'mock' } = req.body;

        // Find order and validate ownership
        const order = await Order.findOne({
            _id: orderId,
            userId: userId,
            orderStatus: 'PENDING_PAYMENT',
            isDeleted: 0
        }).session(session);

        if (!order) {
            throw new HttpException(404, "Order not found or already processed");
        }

        // Find payment record
        const payment = await Payment.findOne({
            orderId: orderId,
            status: 0 // pending
        }).session(session);

        if (!payment) {
            throw new HttpException(404, "Payment record not found");
        }

        // Check if payment has expired
        if (payment.expiresAt < new Date()) {
            throw new HttpException(400, "Payment has expired. Please create a new order.");
        }

        // Get order items to finalize stock reduction
        const orderItems = await OrderItem.find({ orderId: orderId }).session(session);

        // Mock payment processing (always successful for demo)
        const mockTransactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mockGatewayResponse = {
            transactionId: mockTransactionId,
            status: 'success',
            message: 'Payment processed successfully',
            timestamp: new Date(),
            gateway: 'mock_payment_gateway'
        };

        // Update payment record
        payment.status = 1; // completed
        payment.paymentMethod = paymentMethod;
        payment.transactionId = mockTransactionId;
        payment.gatewayResponse = mockGatewayResponse;
        payment.paidAt = new Date();
        await payment.save({ session });

        // Update order status
        order.orderStatus = 'PAID';
        await order.save({ session });

        // Finalize stock reduction (move from reserved to actual stock reduction)
        for (const orderItem of orderItems) {
            await Product.findByIdAndUpdate(
                orderItem.productId,
                {
                    $inc: {
                        totalStock: -orderItem.quantity,
                        reservedStock: -orderItem.quantity
                    }
                },
                { session }
            );
        }

        await session.commitTransaction();

        // TODO: Queue email confirmation job here
        console.log(`Order ${orderId} paid successfully. Queuing confirmation email for user ${userId}`);

        const responseData = {
            orderId: order._id,
            orderStatus: order.orderStatus,
            payment: {
                id: payment._id,
                transactionId: payment.transactionId,
                status: payment.status,
                paymentMethod: payment.paymentMethod,
                amount: parseFloat(payment.amount.toString()),
                paidAt: payment.paidAt
            },
            totalAmount: parseFloat(order.totalAmount.toString())
        };

        return res.status(200).json({
            success: true,
            message: "Payment processed successfully",
            status_code: 200,
            user: {
                id: userId,
                name: req.user.fullName
            },
            data: responseData
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Payment processing error:', error);

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    } finally {
        await session.endSession();
    }
};

// GET /orders → (User Only) Get paginated order history
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.sub;
        const {
            page = 1,
            limit = 10,
            status = 'all',
            sortOrder = 'desc'
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        // Build filter conditions
        const filterConditions = {
            userId: userId,
            isDeleted: 0
        };

        if (status !== 'all') {
            filterConditions.orderStatus = status;
        }

        // Build sort object
        const sortObj = { createdAt: sortOrder === 'desc' ? -1 : 1 };

        // Execute queries
        const [orders, totalCount] = await Promise.all([
            Order.find(filterConditions)
                .sort(sortObj)
                .skip(offset)
                .limit(limitNum)
                .populate({
                    path: 'userId',
                    select: 'fullName email'
                })
                .lean(),
            Order.countDocuments(filterConditions)
        ]);

        // Get order items for each order
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const orderItems = await OrderItem.find({ orderId: order._id })
                    .populate('productId', 'name price')
                    .lean();

                const payment = await Payment.findOne({ orderId: order._id })
                    .select('transactionId status paymentMethod paidAt')
                    .lean();

                return {
                    id: order._id,
                    totalAmount: parseFloat(order.totalAmount.toString()),
                    orderStatus: order.orderStatus,
                    notes: order.notes,
                    itemsCount: orderItems.length,
                    items: orderItems.map(item => ({
                        id: item._id,
                        product: {
                            id: item.productId._id,
                            name: item.productId.name
                        },
                        quantity: item.quantity,
                        priceAtPurchase: parseFloat(item.priceAtPurchase.toString()),
                        totalPrice: item.quantity * parseFloat(item.priceAtPurchase.toString())
                    })),
                    payment: payment ? {
                        transactionId: payment.transactionId,
                        status: payment.status,
                        paymentMethod: payment.paymentMethod,
                        paidAt: payment.paidAt
                    } : null,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt
                };
            })
        );

        const totalPages = Math.ceil(totalCount / limitNum);

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            status_code: 200,
            user: {
                id: userId,
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
                sortOrder
            },
            data: ordersWithItems
        });

    } catch (error) {
        console.error('Get user orders error:', error);

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};

// GET /orders/:id → (User Only) Get single order details
exports.getOrderById = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { id: orderId } = req.params;

        // Find order and validate ownership
        const order = await Order.findOne({
            _id: orderId,
            userId: userId,
            isDeleted: 0
        }).populate('userId', 'fullName email');

        if (!order) {
            throw new HttpException(404, "Order not found");
        }

        // Get order items with product details
        const orderItems = await OrderItem.find({ orderId: orderId })
            .populate('productId', 'name price description')
            .lean();

        // Get payment details
        const payment = await Payment.findOne({ orderId: orderId }).lean();

        const responseData = {
            id: order._id,
            totalAmount: parseFloat(order.totalAmount.toString()),
            orderStatus: order.orderStatus,
            notes: order.notes,
            items: orderItems.map(item => ({
                id: item._id,
                product: {
                    id: item.productId._id,
                    name: item.productId.name,
                    description: item.productId.description
                },
                quantity: item.quantity,
                priceAtPurchase: parseFloat(item.priceAtPurchase.toString()),
                totalPrice: item.quantity * parseFloat(item.priceAtPurchase.toString())
            })),
            payment: payment ? {
                id: payment._id,
                transactionId: payment.transactionId,
                status: payment.status,
                paymentMethod: payment.paymentMethod,
                amount: parseFloat(payment.amount.toString()),
                paidAt: payment.paidAt,
                expiresAt: payment.expiresAt
            } : null,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };

        return res.status(200).json({
            success: true,
            message: "Order details fetched successfully",
            status_code: 200,
            user: {
                id: userId,
                name: req.user.fullName
            },
            data: responseData
        });

    } catch (error) {
        console.error('Get order by ID error:', error);

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};
