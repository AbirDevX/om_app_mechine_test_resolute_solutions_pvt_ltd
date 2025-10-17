const mongoose = require('mongoose');
const Product = require('../../../schema/Product');
const { HttpException } = require("../../../utility/exception/httpException");

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

        // Build filter conditions for public access (only active, available products)
        const filterConditions = {
            status: 1,          // Only active products
            isDeleted: 0        // Not deleted
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

        // Execute queries with aggregation to show only available stock
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
                                availableStock: 1,
                                description: 1,
                                createdAt: 1
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

        // Format products for public response (minimal information)
        const formattedProducts = products.map(product => ({
            id: product._id,
            name: product.name,
            price: parseFloat(product.price.toString()),
            availableStock: product.availableStock,
            description: product.description,
            inStock: product.availableStock > 0,
            stockStatus: product.availableStock > 10 ? 'In Stock' : 'Limited Stock'
        }));

        const totalPages = Math.ceil(totalCount / limitNum);

        // Get price range for filtering UI
        const priceRangeResult = await Product.aggregate([
            { $match: { status: 1, isDeleted: 0 } },
            {
                $addFields: {
                    availableStock: { $subtract: ["$totalStock", "$reservedStock"] }
                }
            },
            { $match: { availableStock: { $gt: 0 } } },
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

// GET /products/:id → (Public) Get single product details
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(400, "Invalid product ID format");
        }

        // Find product (only active and not deleted, with available stock)
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
                    stockStatus: availableStock > 10 ? 'In Stock' : 'Limited Stock',
                    createdAt: product.createdAt
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
