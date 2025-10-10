'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('orders', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            user_name: {
                type: Sequelize.STRING(255),
                allowNull: false,
                comment: "Customer name for the order"
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                comment: "Optional reference to users table"
            },
            total_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                comment: "Total order amount calculated from products"
            },
            order_status: {
                type: Sequelize.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
                defaultValue: 'pending',
                allowNull: false
            },
            payment_status: {
                type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'),
                defaultValue: 'pending',
                allowNull: false
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            is_deleted: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "0 -> not deleted, 1 -> deleted"
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

        // Add indexes for better performance
        await queryInterface.addIndex('orders', ['user_id']);
        await queryInterface.addIndex('orders', ['user_name']);
        await queryInterface.addIndex('orders', ['order_status']);
        await queryInterface.addIndex('orders', ['payment_status']);
        await queryInterface.addIndex('orders', ['is_deleted']);
        await queryInterface.addIndex('orders', ['created_at']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('orders');
    }
};
