'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            full_name: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            username: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true,
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true,
            },
            mobile: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            status: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            is_deleted: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: "0 -> not deleted, 1->deleted"
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
        await queryInterface.addIndex('users', ['email']);
        await queryInterface.addIndex('users', ['username']);
        await queryInterface.addIndex('users', ['mobile']);
        await queryInterface.addIndex('users', ['status', 'is_deleted']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};
