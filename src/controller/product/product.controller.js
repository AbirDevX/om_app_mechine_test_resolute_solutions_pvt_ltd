const { logError, logInfo } = require("../../utility/logger/logger.utility");
const { Op } = require('sequelize');
const { Product } = require("../../models");
const { HttpException } = require("../../utility/exception/httpException");


exports.create = async (req, res) => {
    try {
        const { name, price, stock, description } = req.body;

        // Check if product with same name already exists
        const existingProduct = await Product.findOne({
            where: {
                name: {
                    [Op.like]: `%${name.trim()}%`
                },
                is_deleted: 0
            }
        });

        if (existingProduct) throw new HttpException(422, "Product with similar name already exists");

        // Create product
        const newProduct = await Product.create({
            name: name.trim(),
            price: parseFloat(price).toFixed(2),
            stock: parseInt(stock),
            description: description ? description.trim() : null,
            status: 1,
            is_deleted: 0,
            created_at: new Date(),
            updated_at: new Date()
        });

        logInfo('Product created successfully', {
            productId: newProduct.id,
            name: newProduct.name,
            price: newProduct.price,
            stock: newProduct.stock
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            status_code: 201,
            data: {
                product: {
                    id: newProduct.id,
                    name: newProduct.name,
                    price: parseFloat(newProduct.price),
                    stock: newProduct.stock,
                    description: newProduct.description,
                    category: newProduct.category,
                    sku: newProduct.sku,
                    status: newProduct.status,
                    created_at: newProduct.created_at
                }
            }
        });

    } catch (error) {
        logError("Creating Product", error?.message, {
            requestBody: req.body
        });

        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};
exports.list = async (req, res) => {
    try {
        const payload = req.query;

        const page = parseInt(payload?.page) || 1;
        const searchQuery = payload?.searchQuery || "";
        const sortBy = payload?.sortBy || "name";
        const sortOrder = payload?.sortOrder || "DESC";
        const limit = parseInt(payload?.limit) || 10;
        const offset = (page - 1) * limit;


        const associations = [];
        const whereClause = {
            status: 1,
            is_deleted: 0,
            ...(searchQuery && {
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${searchQuery}%`,
                        },
                    },
                    {
                        description: {
                            [Op.like]: `%${searchQuery}%`,
                        },
                    },
                ],
            }),
        };

        const query = {
            where: whereClause,
            include: associations,
            attributes: { exclude: ["status", "is_deleted", "updated_at"] },
            offset: offset,
            limit: limit,
            order: [[sortBy, sortOrder]]
        };

        const totalCount = await Product.count({ where: whereClause, distinct: true });
        const list = await Product.findAll(query);

        const totalPages = Math.ceil(totalCount / limit);

        // Return the Admin data and token
        return res.status(200).json({
            status: true,
            message: "List Fetched Successfully",
            status_code: 200,
            pagination: {
                total: totalCount,
                totalPages: totalPages,
                currentPage: page,
                perPage: limit,
            },
            data: list
        });
    } catch (error) {
        logError("Fetching Product List", error?.message);
        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";
        return res.status(status).json({
            message,
            status: false,
            status_code: status,
            error
        });
    }
};