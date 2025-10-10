'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('orders', [
            {
                id: 1,
                user_name: 'John Doe',
                user_id: 1,
                total_amount: 229998.99,
                order_status: 'confirmed',
                payment_status: 'paid',
                notes: 'Customer requested express delivery',
                is_deleted: 0,
                created_at: new Date('2024-10-01'),
                updated_at: new Date('2024-10-01'),
            },
            {
                id: 2,
                user_name: 'Jane Smith',
                user_id: 2,
                total_amount: 54998.00,
                order_status: 'processing',
                payment_status: 'paid',
                notes: 'Gift wrapping requested',
                is_deleted: 0,
                created_at: new Date('2024-10-05'),
                updated_at: new Date('2024-10-05'),
            },
            {
                id: 3,
                user_name: 'Test Customer',
                user_id: 4,
                total_amount: 179998.00,
                order_status: 'shipped',
                payment_status: 'paid',
                notes: 'Standard shipping',
                is_deleted: 0,
                created_at: new Date('2024-09-28'),
                updated_at: new Date('2024-10-02'),
            },
            {
                id: 4,
                user_name: 'Demo User',
                user_id: 5,
                total_amount: 42999.00,
                order_status: 'pending',
                payment_status: 'pending',
                notes: 'Awaiting payment confirmation',
                is_deleted: 0,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 5,
                user_name: 'Admin User',
                user_id: 3,
                total_amount: 94998.00,
                order_status: 'delivered',
                payment_status: 'paid',
                notes: 'Successfully delivered, customer satisfied',
                is_deleted: 0,
                created_at: new Date('2024-09-20'),
                updated_at: new Date('2024-09-25'),
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('orders', null, {});
    }
};
