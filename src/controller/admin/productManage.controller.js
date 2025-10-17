const mongoose = require('mongoose');
const Product = require('../../schema/Product');
const { HttpException } = require("../../utility/exception/httpException");

// POST /products → (Admin Only) Add a new product
exports.create = async (req, res) => {
    try {
        const { name, price, totalStock, description } = req.body;
        const adminId = req.user.id;

        // Check if product with same name already exists (case-insensitive)
        const existingProduct = await Product.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            isDeleted: 0
        });

        if (existingProduct) {
            throw new HttpException(409, "Product with similar name already exists");
        }

        // Create product with proper Decimal128 handling
        const newProduct = await Product.create({
            name: name.trim(),
            price: mongoose.Types.Decimal128.fromString(parseFloat(price).toFixed(2)),
            totalStock: parseInt(totalStock),
            reservedStock: 0,
            description: description ? description.trim() : null,
            status: 1,
            isDeleted: 0
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            status_code: 201,
            data: {
                product: {
                    id: newProduct._id,
                    name: newProduct.name,
                    price: parseFloat(newProduct.price.toString()),
                    totalStock: newProduct.totalStock,
                    reservedStock: newProduct.reservedStock,
                    availableStock: newProduct.totalStock - newProduct.reservedStock,
                    description: newProduct.description,
                    status: newProduct.status,
                    createdAt: newProduct.createdAt
                }
            }
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

// PUT /products/:id → (Admin Only) Update an existing product
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const adminId = req.user.id;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(400, "Invalid product ID format");
        }

        // Find existing product
        const existingProduct = await Product.findOne({
            _id: id,
            isDeleted: 0
        });

        if (!existingProduct) {
            throw new HttpException(404, "Product not found");
        }

        // Prepare update object with proper data types
        const updateObj = {};

        if (updateData.name) {
            // Check name uniqueness (excluding current product)
            const duplicateName = await Product.findOne({
                name: { $regex: new RegExp(`^${updateData.name.trim()}$`, 'i') },
                _id: { $ne: id },
                isDeleted: 0
            });

            if (duplicateName) {
                throw new HttpException(409, "Product with similar name already exists");
            }

            updateObj.name = updateData.name.trim();
        }

        if (updateData.price !== undefined) {
            updateObj.price = mongoose.Types.Decimal128.fromString(parseFloat(updateData.price).toFixed(2));
        }

        if (updateData.totalStock !== undefined) {
            const newTotalStock = parseInt(updateData.totalStock);

            // Ensure totalStock is not less than reservedStock
            if (newTotalStock < existingProduct.reservedStock) {
                throw new HttpException(400,
                    `Total stock cannot be less than reserved stock (${existingProduct.reservedStock})`
                );
            }

            updateObj.totalStock = newTotalStock;
        }

        if (updateData.description !== undefined) {
            updateObj.description = updateData.description ? updateData.description.trim() : null;
        }

        if (updateData.status !== undefined) {
            updateObj.status = parseInt(updateData.status);
        }

        updateObj.updatedAt = new Date();

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateObj,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            status_code: 200,
            data: {
                product: {
                    id: updatedProduct._id,
                    name: updatedProduct.name,
                    price: parseFloat(updatedProduct.price.toString()),
                    totalStock: updatedProduct.totalStock,
                    reservedStock: updatedProduct.reservedStock,
                    availableStock: updatedProduct.totalStock - updatedProduct.reservedStock,
                    description: updatedProduct.description,
                    status: updatedProduct.status,
                    createdAt: updatedProduct.createdAt,
                    updatedAt: updatedProduct.updatedAt
                }
            }
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

// DELETE /products/:id → (Admin Only) Delete a product
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(400, "Invalid product ID format");
        }

        // Find product and check if it exists
        const product = await Product.findOne({
            _id: id,
            isDeleted: 0
        });

        if (!product) {
            throw new HttpException(404, "Product not found");
        }

        // Check if product has reserved stock (prevent deletion of products in pending orders)
        if (product.reservedStock > 0) {
            throw new HttpException(409,
                `Cannot delete product with reserved stock (${product.reservedStock} items reserved)`
            );
        }

        // Soft delete the product
        await Product.findByIdAndUpdate(id, {
            isDeleted: 1,
            updatedAt: new Date()
        });

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            status_code: 200,
            data: {
                deletedProduct: {
                    id: product._id,
                    name: product.name
                }
            }
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

// GET /products/:id → (Public) Get single product details
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(400, "Invalid product ID format");
        }

        // Find product (only active and not deleted)
        const product = await Product.findOne({
            _id: id,
            status: 1,
            isDeleted: 0
        });

        if (!product) {
            throw new HttpException(404, "Product not found");
        }

        const availableStock = product.totalStock - product.reservedStock;

        // Check if product is available
        if (availableStock <= 0) {
            throw new HttpException(404, "Product is currently out of stock");
        }

        return res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            status_code: 200,
            data: {
                product: {
                    id: product._id,
                    name: product.name,
                    price: parseFloat(product.price.toString()),
                    availableStock: availableStock,
                    description: product.description,
                    inStock: availableStock > 0,
                    stockStatus: availableStock > 10 ? 'In Stock' :
                        availableStock > 0 ? 'Limited Stock' : 'Out of Stock',
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Public product detail error:', error);

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};

// GET /products → (Public) List all products with pagination, sorting, and filtering
exports.list = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            sortBy = 'name',
            sortOrder = 'asc',
            name = '',
            minPrice,
            maxPrice
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        // Validate pagination parameters
        if (pageNum < 1) {
            throw new HttpException(400, "Page number must be at least 1");
        }

        if (limitNum < 1 || limitNum > 100) {
            throw new HttpException(400, "Limit must be between 1 and 100");
        }

        // Build filter conditions for active products only
        const filterConditions = {
            status: 1,
            isDeleted: 0
        };

        // Filter by name (case-insensitive partial match)
        if (name && name.trim()) {
            filterConditions.name = new RegExp(name.trim(), 'i');
        }

        // Price range filtering
        if (minPrice || maxPrice) {
            filterConditions.price = {};

            if (minPrice) {
                const minPriceDecimal = mongoose.Types.Decimal128.fromString(parseFloat(minPrice).toFixed(2));
                filterConditions.price.$gte = minPriceDecimal;
            }

            if (maxPrice) {
                const maxPriceDecimal = mongoose.Types.Decimal128.fromString(parseFloat(maxPrice).toFixed(2));
                filterConditions.price.$lte = maxPriceDecimal;
            }
        }

        // Build sort object
        const sortObj = {};
        const allowedSortFields = ['name', 'price', 'createdAt'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        sortObj[sortField] = sortDirection;

        // Execute queries with aggregation to calculate available stock
        const aggregationPipeline = [
            { $match: filterConditions },
            {
                $addFields: {
                    availableStock: { $subtract: ["$totalStock", "$reservedStock"] }
                }
            },
            { $match: { availableStock: { $gt: 0 } } }, // Only show products with available stock
            { $sort: sortObj },
            {
                $facet: {
                    products: [
                        { $skip: offset },
                        { $limit: limitNum },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                price: 1,
                                totalStock: 1,
                                reservedStock: 1,
                                availableStock: 1,
                                description: 1,
                                status: 1,
                                createdAt: 1,
                                updatedAt: 1
                            }
                        }
                    ],
                    totalCount: [{ $count: "count" }]
                }
            }
        ];

        const result = await Product.aggregate(aggregationPipeline);
        const products = result[0].products;
        const totalCount = result[0].totalCount[0]?.count || 0;

        // Format products for response
        const formattedProducts = products.map(product => ({
            id: product._id,
            name: product.name,
            price: parseFloat(product.price.toString()),
            availableStock: product.availableStock,
            description: product.description,
            inStock: product.availableStock > 0,
            stockStatus: product.availableStock > 10 ? 'In Stock' :
                product.availableStock > 0 ? 'Limited Stock' : 'Out of Stock',
            createdAt: product.createdAt
        }));

        const totalPages = Math.ceil(totalCount / limitNum);

        // Price range for frontend filtering
        const priceRangeResult = await Product.aggregate([
            { $match: { status: 1, isDeleted: 0 } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" }
                }
            }
        ]);

        const priceRange = priceRangeResult[0] ? {
            min: parseFloat(priceRangeResult[0].minPrice.toString()),
            max: parseFloat(priceRangeResult[0].maxPrice.toString())
        } : { min: 0, max: 0 };

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            status_code: 200,
            pagination: {
                total: totalCount,
                totalPages: totalPages,
                currentPage: pageNum,
                perPage: limitNum,
                hasNext: pageNum < totalPages,
                hasPrev: pageNum > 1
            },
            filters: {
                name: name || '',
                minPrice: minPrice ? parseFloat(minPrice) : null,
                maxPrice: maxPrice ? parseFloat(maxPrice) : null,
                sortBy: sortField,
                sortOrder: sortOrder
            },
            priceRange,
            data: formattedProducts
        });

    } catch (error) {
        console.error('Public product list error:', error);

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};
