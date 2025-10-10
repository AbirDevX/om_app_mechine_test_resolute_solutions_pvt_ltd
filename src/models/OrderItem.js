"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class OrderItem extends Model {
        static associate(models) {
            // Belongs to Order
            OrderItem.belongsTo(models.Order, {
                foreignKey: 'order_id',
                as: 'order'
            });
            
            // Belongs to Product
            OrderItem.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });
        }
    }

    OrderItem.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            order_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'orders',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            qty: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 1
                },
                comment: "Quantity of product in this order"
            },
            unit_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                comment: "Price per unit at time of order"
            },
            total_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                comment: "qty * unit_price"
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
            modelName: "OrderItem",
            tableName: "order_items",
            underscored: true,
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ['order_id', 'product_id']
                }
            ]
        }
    );

    return OrderItem;
};
