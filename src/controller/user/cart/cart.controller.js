const mongoose = require('mongoose');
const Cart = require('../../../schema/Cart');
const CartItem = require('../../../schema/CartItem');
const Product = require('../../../schema/Product');
const { HttpException } = require("../../../utility/exception/httpException");

// GET /cart → (User Only) View the contents of the user's cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user.sub;

        // Find or create user's active cart
        let cart = await Cart.findOne({
            userId: userId,
            status: 1 // Active cart
        });

        if (!cart) {

            // Create new cart if none exists
            cart = await Cart.create({
                userId: userId,
                status: 1
            });
        }

        // Get cart items with product details
        const cartItems = await CartItem.find({ cartId: cart._id })
            .populate({
                path: 'productId',
                select: 'name price totalStock reservedStock status isDeleted',
                match: { status: 1, isDeleted: 0 }
            })
            .sort({ createdAt: -1 });

        // Filter out items with deleted/inactive products
        const validCartItems = cartItems.filter(item => item.productId);

        // Remove invalid items from cart
        const invalidItemIds = cartItems
            .filter(item => !item.productId)
            .map(item => item._id);

        if (invalidItemIds.length > 0) {
            await CartItem.deleteMany({ _id: { $in: invalidItemIds } });
        }

        // Format cart items with availability check
        const formattedItems = await Promise.all(
            validCartItems.map(async (item) => {
                const product = item.productId;
                const availableStock = product.totalStock - product.reservedStock;
                const isAvailable = availableStock > 0;
                const maxQuantityAvailable = Math.min(availableStock, item.quantity);

                return {
                    id: item._id,
                    product: {
                        id: product._id,
                        name: product.name,
                        price: parseFloat(product.price.toString()),
                        availableStock: availableStock
                    },
                    quantity: item.quantity,
                    unitPrice: parseFloat(item.unitPrice.toString()),
                    totalPrice: parseFloat(item.totalPrice.toString()),
                    isAvailable: isAvailable,
                    maxQuantityAvailable: maxQuantityAvailable,
                    stockStatus: availableStock >= item.quantity ? 'Available' :
                        availableStock > 0 ? 'Limited Stock' : 'Out of Stock',
                    addedAt: item.createdAt
                };
            })
        );

        // Calculate cart totals
        const cartSummary = {
            totalItems: formattedItems.length,
            totalQuantity: formattedItems.reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: formattedItems.reduce((sum, item) => sum + item.totalPrice, 0),
            availableItems: formattedItems.filter(item => item.isAvailable).length,
            unavailableItems: formattedItems.filter(item => !item.isAvailable).length
        };

        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            status_code: 200,
            user: {
                id: userId,
                name: req.user.fullName
            },
            cart: {
                id: cart._id,
                status: cart.status,
                summary: cartSummary,
                items: formattedItems,
                createdAt: cart.createdAt,
                updatedAt: cart.updatedAt
            }
        });

    } catch (error) {
        console.error('Get cart error:', error);

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};

// POST /cart/items → (User Only) Add an item to the cart or update its quantity
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { productId, quantity = 1 } = req.body;

        // Validate product exists and is available
        const product = await Product.findOne({
            _id: productId,
            status: 1,
            isDeleted: 0
        });

        if (!product) {
            throw new HttpException(404, "Product not found or unavailable");
        }

        // Check stock availability
        const availableStock = product.totalStock - product.reservedStock;
        if (availableStock <= 0) {
            throw new HttpException(400, "Product is out of stock");
        }

        // Find or create user's active cart
        let cart = await Cart.findOne({
            userId: userId,
            status: 1
        });

        if (!cart) {
            cart = await Cart.create({
                userId: userId,
                status: 1
            });
        }

        // Check if item already exists in cart
        let cartItem = await CartItem.findOne({
            cartId: cart._id,
            productId: productId
        });

        const requestedQuantity = quantity;
        let finalQuantity = requestedQuantity;

        if (cartItem) {
            // Update existing item
            finalQuantity = cartItem.quantity + requestedQuantity;
        }

        // Validate final quantity against available stock
        if (finalQuantity > availableStock) {
            throw new HttpException(400,
                `Insufficient stock. Available: ${availableStock}, Requested: ${finalQuantity}`
            );
        }

        // Validate quantity limits
        if (finalQuantity > 100) { // Business rule: max 100 per item
            throw new HttpException(400, "Maximum quantity per item is 100");
        }

        const unitPrice = product.price;

        if (cartItem) {
            // Update existing cart item
            cartItem.quantity = finalQuantity;
            cartItem.unitPrice = unitPrice;
            // totalPrice will be calculated by pre-save middleware
            await cartItem.save();
        } else {
            // Create new cart item
            cartItem = await CartItem.create({
                cartId: cart._id,
                productId: productId,
                quantity: finalQuantity,
                unitPrice: unitPrice,
                totalPrice: mongoose.Types.Decimal128.fromString(
                    (finalQuantity * parseFloat(unitPrice.toString())).toFixed(2)
                )
            });
        }

        // Update cart timestamp
        cart.updatedAt = new Date();
        await cart.save();

        // Populate product details for response
        await cartItem.populate('productId', 'name price totalStock reservedStock');

        const responseData = {
            id: cartItem._id,
            product: {
                id: cartItem.productId._id,
                name: cartItem.productId.name,
                price: parseFloat(cartItem.productId.price.toString()),
                availableStock: cartItem.productId.totalStock - cartItem.productId.reservedStock
            },
            quantity: cartItem.quantity,
            unitPrice: parseFloat(cartItem.unitPrice.toString()),
            totalPrice: parseFloat(cartItem.totalPrice.toString()),
            action: cartItem.quantity === requestedQuantity ? 'added' : 'updated',
            addedAt: cartItem.createdAt
        };

        return res.status(200).json({
            success: true,
            message: `Item ${responseData.action} to cart successfully`,
            status_code: 200,
            user: {
                id: userId,
                name: req.user.fullName
            },
            data: responseData
        });

    } catch (error) {
        console.error('Add to cart error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Item already being processed. Please try again.",
                status_code: 409,
                error: "concurrent_update"
            });
        }

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};

// DELETE /cart/items/:productId → (User Only) Remove an item from the cart
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { productId } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new HttpException(400, "Invalid product ID format");
        }

        // Find user's active cart
        const cart = await Cart.findOne({
            userId: userId,
            status: 1
        });

        if (!cart) {
            throw new HttpException(404, "Cart not found");
        }

        // Find cart item
        const cartItem = await CartItem.findOne({
            cartId: cart._id,
            productId: productId
        }).populate('productId', 'name price');

        if (!cartItem) {
            throw new HttpException(404, "Item not found in cart");
        }

        // Store item details for response
        const removedItem = {
            id: cartItem._id,
            product: {
                id: cartItem.productId._id,
                name: cartItem.productId.name,
                price: parseFloat(cartItem.productId.price.toString())
            },
            quantity: cartItem.quantity,
            unitPrice: parseFloat(cartItem.unitPrice.toString()),
            totalPrice: parseFloat(cartItem.totalPrice.toString())
        };

        // Remove item from cart
        await CartItem.deleteOne({ _id: cartItem._id });

        // Update cart timestamp
        cart.updatedAt = new Date();
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            status_code: 200,
            user: {
                id: userId,
                name: req.user.fullName
            },
            data: {
                removedItem: removedItem,
                removedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Remove from cart error:', error);

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};

// PUT /cart/items/:productId → (User Only) Update item quantity in cart
exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { productId } = req.params;
        const { quantity } = req.body;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new HttpException(400, "Invalid product ID format");
        }

        // Validate quantity
        if (quantity < 1 || quantity > 100) {
            throw new HttpException(400, "Quantity must be between 1 and 100");
        }

        // Find user's active cart
        const cart = await Cart.findOne({
            userId: userId,
            status: 1
        });

        if (!cart) {
            throw new HttpException(404, "Cart not found");
        }

        // Find cart item
        const cartItem = await CartItem.findOne({
            cartId: cart._id,
            productId: productId
        });

        if (!cartItem) {
            throw new HttpException(404, "Item not found in cart");
        }

        // Check product availability and stock
        const product = await Product.findOne({
            _id: productId,
            status: 1,
            isDeleted: 0
        });

        if (!product) {
            throw new HttpException(404, "Product not found or unavailable");
        }

        const availableStock = product.totalStock - product.reservedStock;
        if (quantity > availableStock) {
            throw new HttpException(400,
                `Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`
            );
        }

        // Update cart item
        cartItem.quantity = quantity;
        cartItem.unitPrice = product.price;
        // totalPrice will be calculated by pre-save middleware
        await cartItem.save();

        // Update cart timestamp
        cart.updatedAt = new Date();
        await cart.save();

        // Populate product details for response
        await cartItem.populate('productId', 'name price totalStock reservedStock');

        const responseData = {
            id: cartItem._id,
            product: {
                id: cartItem.productId._id,
                name: cartItem.productId.name,
                price: parseFloat(cartItem.productId.price.toString()),
                availableStock: cartItem.productId.totalStock - cartItem.productId.reservedStock
            },
            quantity: cartItem.quantity,
            unitPrice: parseFloat(cartItem.unitPrice.toString()),
            totalPrice: parseFloat(cartItem.totalPrice.toString()),
            updatedAt: cartItem.updatedAt
        };

        return res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            status_code: 200,
            user: {
                id: userId,
                name: req.user.fullName
            },
            data: responseData
        });

    } catch (error) {
        console.error('Update cart item error:', error);

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};

// DELETE /cart/clear → (User Only) Clear entire cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.sub;

        // Find user's active cart
        const cart = await Cart.findOne({
            userId: userId,
            status: 1
        });

        if (!cart) {
            throw new HttpException(404, "Cart not found");
        }

        // Get count of items before clearing
        const itemCount = await CartItem.countDocuments({ cartId: cart._id });

        // Clear all cart items
        await CartItem.deleteMany({ cartId: cart._id });

        // Update cart timestamp
        cart.updatedAt = new Date();
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            status_code: 200,
            user: {
                id: userId,
                name: req.user.fullName
            },
            data: {
                clearedItemsCount: itemCount,
                clearedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Clear cart error:', error);

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};
