'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('order_items', [
            // Order 1 - John Doe (MacBook Pro + AirPods Pro)
            {
                id: 1,
                order_id: 1,
                product_id: 1, // MacBook Pro
                qty: 1,
                unit_price: 199999.99,
                total_price: 199999.99,
                created_at: new Date('2024-10-01'),
                updated_at: new Date('2024-10-01'),
            },
            {
                id: 2,
                order_id: 1,
                product_id: 7, // AirPods Pro
                qty: 1,
                unit_price: 24999.00,
                total_price: 24999.00,
                created_at: new Date('2024-10-01'),
                updated_at: new Date('2024-10-01'),
            },
            
            // Order 2 - Jane Smith (Sony Headphones + AirPods Pro)
            {
                id: 3,
                order_id: 2,
                product_id: 4, // Sony WH-1000XM5
                qty: 1,
                unit_price: 29999.00,
                total_price: 29999.00,
                created_at: new Date('2024-10-05'),
                updated_at: new Date('2024-10-05'),
            },
            {
                id: 4,
                order_id: 2,
                product_id: 7, // AirPods Pro
                qty: 1,
                unit_price: 24999.00,
                total_price: 24999.00,
                created_at: new Date('2024-10-05'),
                updated_at: new Date('2024-10-05'),
            },
            
            // Order 3 - Test Customer (iPhone + Dell XPS)
            {
                id: 5,
                order_id: 3,
                product_id: 2, // iPhone 15 Pro
                qty: 1,
                unit_price: 129999.00,
                total_price: 129999.00,
                created_at: new Date('2024-09-28'),
                updated_at: new Date('2024-09-28'),
            },
            {
                id: 6,
                order_id: 3,
                product_id: 5, // Dell XPS 13
                qty: 1,
                unit_price: 149999.00,
                total_price: 149999.00,
                created_at: new Date('2024-09-28'),
                updated_at: new Date('2024-09-28'),
            },
            
            // Order 4 - Demo User (Apple Watch)
            {
                id: 7,
                order_id: 4,
                product_id: 9, // Apple Watch
                qty: 1,
                unit_price: 42999.00,
                total_price: 42999.00,
                created_at: new Date(),
                updated_at: new Date(),
            },
            
            // Order 5 - Admin User (Samsung Galaxy + iPad Air)
            {
                id: 8,
                order_id: 5,
                product_id: 3, // Samsung Galaxy S24
                qty: 1,
                unit_price: 89999.00,
                total_price: 89999.00,
                created_at: new Date('2024-09-20'),
                updated_at: new Date('2024-09-20'),
            },
            {
                id: 9,
                order_id: 5,
                product_id: 6, // iPad Air
                qty: 1,
                unit_price: 69999.00,
                total_price: 69999.00,
                created_at: new Date('2024-09-20'),
                updated_at: new Date('2024-09-20'),
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('order_items', null, {});
    }
};
