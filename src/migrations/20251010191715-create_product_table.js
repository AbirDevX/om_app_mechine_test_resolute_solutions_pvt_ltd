'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('products', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                comment: "Product price with 2 decimal places"
            },
            stock: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "Available stock quantity"
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            status: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
                comment: "1 -> active, 0 -> inactive"
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
        await queryInterface.addIndex('products', ['name']);
        await queryInterface.addIndex('products', ['status', 'is_deleted']);
        await queryInterface.addIndex('products', ['stock']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('products');
    }
};
