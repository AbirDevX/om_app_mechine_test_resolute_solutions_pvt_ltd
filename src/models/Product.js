"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            // Many-to-Many relationship with Order through OrderItems
            Product.belongsToMany(models.Order, {
                through: models.OrderItem,
                foreignKey: 'product_id',
                otherKey: 'order_id',
                as: 'orders'
            });
            
            // One-to-Many with OrderItems (for direct access)
            Product.hasMany(models.OrderItem, {
                foreignKey: 'product_id',
                as: 'orderItems'
            });
        }
    }

    Product.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                comment: "Product price with 2 decimal places"
            },
            stock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "Available stock quantity"
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
                comment: "1 -> active, 0 -> inactive"
            },
            is_deleted: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "0 -> not deleted, 1 -> deleted"
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "Product",
            tableName: "products",
            underscored: true,
            timestamps: false,
        }
    );

    return Product;
};
