const { HttpException } = require("../../../utility/exception/httpException");

exports.create = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { userName, products, notes } = req.body;
        const user = req?.user;

        // Step 1: Validate all products exist and have sufficient stock
        const productIds = products.map(item => item.productId);
        const dbProducts = await Product.findAll({
            where: {
                id: productIds,
                status: 1,
                is_deleted: 0
            },
            transaction
        });

        // Check if all products exist
        if (dbProducts.length !== productIds.length) {
            const foundIds = dbProducts.map(p => p.id);
            const missingIds = productIds.filter(id => !foundIds.includes(id));
            throw new HttpException(400, `Products not found: ${missingIds.join(', ')}`);
        }

        // Step 2: Validate stock availability for each product
        const stockValidationErrors = [];
        const orderItems = [];
        let totalAmount = 0;

        for (const orderProduct of products) {
            const dbProduct = dbProducts.find(p => p.id === orderProduct.productId);

            if (dbProduct.stock < orderProduct.qty) {
                stockValidationErrors.push({
                    productId: orderProduct.productId,
                    productName: dbProduct.name,
                    requestedQty: orderProduct.qty,
                    availableStock: dbProduct.stock
                });
                continue;
            }

            // Prepare order item data
            const unitPrice = parseFloat(dbProduct.price);
            const totalPrice = unitPrice * orderProduct.qty;

            orderItems.push({
                product_id: orderProduct.productId,
                qty: orderProduct.qty,
                unit_price: unitPrice,
                total_price: totalPrice,
                product: dbProduct
            });

            totalAmount += totalPrice;
        }

        // If any stock validation errors, throw exception
        if (stockValidationErrors.length > 0) {
            throw new HttpException(400, 'Insufficient stock for products', {
                errors: stockValidationErrors
            });
        }

        // Step 3: Create order (atomic transaction begins)
        const order = await Order.create({
            user_name: userName,
            user_id: user?.sub,
            total_amount: totalAmount.toFixed(2),
            order_status: 'confirmed',
            payment_status: 'pending',
            notes: notes || null
        }, { transaction });

        // Step 4: Create order items and update product stock atomically
        const createdOrderItems = [];

        for (const item of orderItems) {
            // Create order item
            const orderItem = await OrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                qty: item.qty,
                unit_price: item.unit_price,
                total_price: item.total_price
            }, { transaction });

            // Decrement product stock atomically
            await Product.decrement('stock', {
                by: item.qty,
                where: { id: item.product_id },
                transaction
            });

            createdOrderItems.push({
                ...orderItem.dataValues,
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    price: item.product.price
                }
            });
        }

        // Commit transaction - all operations successful
        await transaction.commit();

        // Step 5: Fetch complete order with populated data
        const completeOrder = await Order.findByPk(order.id, {
            include: [
                {
                    model: OrderItem,
                    as: 'orderItems',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'price', 'stock']
                        }
                    ]
                }
            ]
        });

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            status_code: 201,
            data: {
                order: completeOrder,
                summary: {
                    orderId: order.id,
                    userName: userName,
                    totalItems: products.length,
                    totalAmount: totalAmount.toFixed(2),
                    orderStatus: 'confirmed',
                    paymentStatus: 'pending'
                }
            }
        });

    } catch (error) {
        // Rollback transaction on any error
        transaction && await transaction.rollback();

        logError("Creating Order", error?.message);

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";
        const errorData = error?.data || null;

        return res.status(status).json({
            success: false,
            message,
            status_code: status,
            ...(errorData && { errors: errorData.errors })
        });
    }
};

exports.list = async (req, res) => {
    try {
        const payload = req.query;
        const user = req?.user;

        const page = parseInt(payload?.page) || 1;
        const limit = parseInt(payload?.limit) || 10;
        const offset = (page - 1) * limit;

        const whereClause = {
            is_deleted: 0,
            user_id: user?.sub
        };

        // Add order status filter if provided
        if (payload.orderStatus) {
            whereClause.order_status = payload.orderStatus;
        }

        const query = {
            where: whereClause,
            include: [
                {
                    model: OrderItem,
                    as: 'orderItems',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'price', 'description']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']],
            offset: offset,
            limit: limit,
        };

        const totalCount = await Order.count({
            where: whereClause,
            distinct: true
        });
        const orders = await Order.findAll(query);

        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            status_code: 200,
            pagination: {
                total: totalCount,
                totalPages: totalPages,
                currentPage: page,
                perPage: limit,
            },
            data: orders
        });

    } catch (error) {
        logError("Fetching Orders List", error?.message);
        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";
        return res.status(status).json({
            success: false,
            message,
            status_code: status,
        });
    }
};
