const mongoose = require('mongoose');
const Product = require('../schema/Product');
const connectToMongoDb = require('../config/mongo.config');
require('dotenv').config();

// Sample product data
const getProductsData = () => {
    return [
        {
            name: 'MacBook Pro 14"',
            price: mongoose.Types.Decimal128.fromString('199999.99'),
            description: 'Apple MacBook Pro with M2 chip, 14-inch display, 512GB storage',
            totalStock: 25,
            reservedStock: 0,
            status: 1,
            isDeleted: 0
        },
        {
            name: 'iPhone 15 Pro',
            price: mongoose.Types.Decimal128.fromString('129999.00'),
            description: 'Latest iPhone 15 Pro with 256GB storage, Titanium finish',
            totalStock: 50,
            reservedStock: 0,
            status: 1,
            isDeleted: 0
        },
        {
            name: 'Samsung Galaxy S24',
            price: mongoose.Types.Decimal128.fromString('89999.00'),
            description: 'Samsung Galaxy S24 with 128GB storage, AI features',
            totalStock: 30,
            reservedStock: 0,
            status: 1,
            isDeleted: 0
        },
        {
            name: 'Sony WH-1000XM5',
            price: mongoose.Types.Decimal128.fromString('29999.00'),
            description: 'Premium noise-cancelling wireless headphones',
            totalStock: 100,
            reservedStock: 0,
            status: 1,
            isDeleted: 0
        },
        {
            name: 'Dell XPS 13',
            price: mongoose.Types.Decimal128.fromString('149999.00'),
            description: 'Ultra-thin laptop with Intel i7, 16GB RAM, 1TB SSD',
            totalStock: 15,
            reservedStock: 0,
            status: 1,
            isDeleted: 0
        },
        {
            name: 'iPad Air 5th Gen',
            price: mongoose.Types.Decimal128.fromString('69999.00'),
            description: 'iPad Air with M1 chip, 10.9-inch display, 256GB',
            totalStock: 40,
            reservedStock: 0,
            status: 1,
            isDeleted: 0
        },
        {
            name: 'AirPods Pro 2nd Gen',
            price: mongoose.Types.Decimal128.fromString('24999.00'),
            description: 'Wireless earbuds with active noise cancellation',
            totalStock: 75,
            reservedStock: 0,
            status: 1,
            isDeleted: 0
        },
        {
            name: 'Nintendo Switch OLED',
            price: mongoose.Types.Decimal128.fromString('34999.00'),
            description: 'Gaming console with 7-inch OLED screen',
            totalStock: 20,
            reservedStock: 0,
            status: 1,
            isDeleted: 0
        },
        {
            name: 'Apple Watch Series 9',
            price: mongoose.Types.Decimal128.fromString('42999.00'),
            description: 'Smart watch with GPS, 45mm case, Sport Band',
            totalStock: 35,
            reservedStock: 0,
            status: 1,
            isDeleted: 0
        },
        {
            name: 'Low Stock Item',
            price: mongoose.Types.Decimal128.fromString('999.00'),
            description: 'Test product with low stock for testing insufficient stock scenarios',
            totalStock: 2,
            reservedStock: 0,
            status: 1,
            isDeleted: 0
        }
    ];
};

// Seed products function
const seedProducts = async () => {
    try {
        console.log('🌱 Starting product seeding process...');
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');
        
        // Get product data
        const productsData = getProductsData();
        
        // Insert products
        const insertedProducts = await Product.insertMany(productsData, { 
            ordered: false 
        });
        
        console.log(`✅ Successfully seeded ${insertedProducts.length} products`);
        
        // Display summary
        console.log('\n📦 Product Summary:');
        console.log('==================');
        
        const totalStock = insertedProducts.reduce((sum, product) => sum + product.totalStock, 0);
        const avgPrice = insertedProducts.reduce((sum, product) => sum + parseFloat(product.price.toString()), 0) / insertedProducts.length;
        
        console.log(`📈 Total Products: ${insertedProducts.length}`);
        console.log(`📊 Total Stock: ${totalStock} items`);
        console.log(`💰 Average Price: ₹${avgPrice.toFixed(2)}`);
        
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        throw error;
    }
};

// Main execution
const runProductSeeder = async () => {
    try {
     await connectToMongoDb();;
        console.log('✅ MongoDB connected successfully');
        
        await seedProducts();
        console.log('\n🎉 Product seeding completed successfully!');
        
    } catch (error) {
        console.error('\n💥 Product seeding failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔐 Database connection closed');
        process.exit(0);
    }
};

// Export for use in master seeder
module.exports = { seedProducts, getProductsData };

// Run if called directly
if (require.main === module) {
    runProductSeeder();
}
