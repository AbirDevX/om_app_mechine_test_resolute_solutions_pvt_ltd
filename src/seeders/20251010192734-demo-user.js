'use strict';
const bcrypt = require('bcrypt');

module.exports = {
    async up(queryInterface, Sequelize) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        await queryInterface.bulkInsert('users', [
            {
                id: 1,
                full_name: 'John Doe',
                username: 'johndoe',
                email: 'john@example.com',
                mobile: '9876543210',
                password: hashedPassword,
                status: 1,
                is_deleted: 0,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 2,
                full_name: 'Jane Smith',
                username: 'janesmith',
                email: 'jane@example.com',
                mobile: '9876543211',
                password: hashedPassword,
                status: 1,
                is_deleted: 0,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 3,
                full_name: 'Admin User',
                username: 'admin',
                email: 'admin@example.com',
                mobile: '9876543212',
                password: hashedPassword,
                status: 1,
                is_deleted: 0,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 4,
                full_name: 'Test Customer',
                username: 'testcustomer',
                email: 'customer@example.com',
                mobile: '9876543213',
                password: hashedPassword,
                status: 1,
                is_deleted: 0,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 5,
                full_name: 'Demo User',
                username: 'demouser',
                email: 'demo@example.com',
                mobile: '9876543214',
                password: hashedPassword,
                status: 1,
                is_deleted: 0,
                created_at: new Date(),
                updated_at: new Date(),
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('users', null, {});
    }
};
