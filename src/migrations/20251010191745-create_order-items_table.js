'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('order_items', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            order_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'orders',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            qty: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: "Quantity of product in this order"
            },
            unit_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                comment: "Price per unit at time of order"
            },
            total_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                comment: "qty * unit_price"
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.NOW,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.NOW,
            },
        });

        // Add unique constraint to prevent duplicate products in same order
        await queryInterface.addIndex('order_items', {
            fields: ['order_id', 'product_id'],
            unique: true,
            name: 'unique_order_product'
        });

        // Add indexes for better performance
        await queryInterface.addIndex('order_items', ['order_id']);
        await queryInterface.addIndex('order_items', ['product_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('order_items');
    }
};
