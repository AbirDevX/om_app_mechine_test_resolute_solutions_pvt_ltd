"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            // Many-to-Many relationship with Product through OrderItems
            Order.belongsToMany(models.Product, {
                through: models.OrderItem,
                foreignKey: 'order_id',
                otherKey: 'product_id',
                as: 'products'
            });
            
            // One-to-Many with OrderItems (for direct access)
            Order.hasMany(models.OrderItem, {
                foreignKey: 'order_id',
                as: 'orderItems'
            });

            // Optional: Relationship with User if needed
            Order.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
        }
    }

    Order.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            user_name: {
                type: DataTypes.STRING(255),
                allowNull: false,
                comment: "Customer name for the order"
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                comment: "Optional reference to users table"
            },
            total_amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                comment: "Total order amount calculated from products"
            },
            order_status: {
                type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
                defaultValue: 'pending',
                allowNull: false
            },
            payment_status: {
                type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
                defaultValue: 'pending',
                allowNull: false
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
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
            modelName: "Order",
            tableName: "orders",
            underscored: true,
            timestamps: false,
        }
    );

    return Order;
};
