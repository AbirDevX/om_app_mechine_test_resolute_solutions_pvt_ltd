const mongoose = require('mongoose');
const connectToMongoDb = require('../config/mongo.config');
require('dotenv').config();

const clearDatabase = async () => {
    try {
        await connectToMongoDb();
        console.log('✅ MongoDB connected successfully');

        console.log('🗑️  Clearing all collections...');

        // Get all collection names
        const collections = await mongoose.connection.db.listCollections().toArray();

        // Drop each collection
        for (const collection of collections) {
            await mongoose.connection.db.collection(collection.name).deleteMany({});
            console.log(`🗑️  Cleared ${collection.name}`);
        }

        console.log('✅ All collections cleared successfully!');

    } catch (error) {
        console.error('❌ Error clearing database:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔐 Database connection closed');
        process.exit(0);
    }
};

// Export for use in other seeders
module.exports = { clearDatabase };

// Run if called directly
if (require.main === module) {
    clearDatabase();
}
