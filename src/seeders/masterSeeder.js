const mongoose = require('mongoose');
const { seedUsers } = require('./userSeeder');
const { seedProducts } = require('./productSeeder');
const connectToMongoDb = require('../config/mongo.config');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
    try {
        await connectToMongoDb();
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

// Main seeder function
const runAllSeeders = async () => {
    try {
        console.log('🚀 Starting master seeding process...\n');
        
        await connectDB();
        
        // Clear existing data (optional)
        console.log('🗑️  Clearing existing data...');
        await mongoose.connection.db.dropDatabase();
        console.log('✅ Database cleared\n');
        
        // Seed users first
        console.log('👥 Seeding Users...');
        await seedUsers();
        console.log('✅ Users seeded successfully\n');
        
        // Seed products
        console.log('📦 Seeding Products...');
        await seedProducts();
        console.log('✅ Products seeded successfully\n');
        
        // Future: Add more seeders here
        // await seedCategories();
        // await seedOrders();
        
        console.log('🎉 All seeding completed successfully!');
        
        // Display summary
        const userCount = await mongoose.model('User').countDocuments();
        const productCount = await mongoose.model('Product').countDocuments();
        
        console.log('\n📊 Database Summary:');
        console.log('===================');
        console.log(`👥 Users: ${userCount}`);
        console.log(`📦 Products: ${productCount}`);
        console.log('\n🔑 Test Credentials:');
        console.log('📧 admin@ecommerce.com');
        console.log('🔒 password123');
        
    } catch (error) {
        console.error('❌ Master seeding failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔐 Database connection closed');
        process.exit(0);
    }
};

// Export for programmatic use
module.exports = { runAllSeeders };

// Run if called directly
if (require.main === module) {
    runAllSeeders();
}
