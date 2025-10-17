const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../schema/User'); // Adjust path as needed
const connectToMongoDb = require('../config/mongo.config');
require('dotenv').config();

// MongoDB connection function
const connectDB = async () => {
    try {
        await connectToMongoDb();

        console.log('✅ MongoDB connected successfully');

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

// Hash password helper
const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        console.error('❌ Password hashing failed:', error);
        throw error;
    }
};

// Sample user data with different roles and statuses
const getUsersData = async () => {
    const defaultPassword = await hashPassword('password123');
    const adminPassword = await hashPassword('admin123');

    return [
        // Admin Users
        {
            fullName: 'Super Admin',
            email: 'admin@ecommerce.com',
            password: adminPassword,
            role: 'ADMIN',
            status: 1,
            isDeleted: 0
        },
        {
            fullName: 'Manager Admin',
            email: 'manager@ecommerce.com',
            password: adminPassword,
            role: 'ADMIN',
            status: 1,
            isDeleted: 0
        },
        {
            fullName: 'Store Admin',
            email: 'store.admin@ecommerce.com',
            password: adminPassword,
            role: 'ADMIN',
            status: 1,
            isDeleted: 0
        },

        // Regular Users
        {
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            password: defaultPassword,
            role: 'USER',
            status: 1,
            isDeleted: 0
        },
        {
            fullName: 'Jane Smith',
            email: 'jane.smith@example.com',
            password: defaultPassword,
            role: 'USER',
            status: 1,
            isDeleted: 0
        },
        {
            fullName: 'Alice Johnson',
            email: 'alice.johnson@example.com',
            password: defaultPassword,
            role: 'USER',
            status: 1,
            isDeleted: 0
        },
        {
            fullName: 'Bob Wilson',
            email: 'bob.wilson@example.com',
            password: defaultPassword,
            role: 'USER',
            status: 1,
            isDeleted: 0
        },
        {
            fullName: 'Emma Davis',
            email: 'emma.davis@example.com',
            password: defaultPassword,
            role: 'USER',
            status: 1,
            isDeleted: 0
        },
        {
            fullName: 'Michael Brown',
            email: 'michael.brown@example.com',
            password: defaultPassword,
            role: 'USER',
            status: 1,
            isDeleted: 0
        },
        {
            fullName: 'Sarah Miller',
            email: 'sarah.miller@example.com',
            password: defaultPassword,
            role: 'USER',
            status: 1,
            isDeleted: 0
        },

        // Test Users with Different States
        {
            fullName: 'Demo Customer',
            email: 'demo@customer.com',
            password: defaultPassword,
            role: 'USER',
            status: 1,
            isDeleted: 0
        },
        {
            fullName: 'VIP Customer',
            email: 'vip@customer.com',
            password: defaultPassword,
            role: 'USER',
            status: 1,
            isDeleted: 0
        },
        {
            fullName: 'Test Customer',
            email: 'test@customer.com',
            password: defaultPassword,
            role: 'USER',
            status: 1,
            isDeleted: 0
        },

        // Edge Cases for Testing
        {
            fullName: 'Inactive User',
            email: 'inactive@example.com',
            password: defaultPassword,
            role: 'USER',
            status: 0, // Inactive
            isDeleted: 0
        },
        {
            fullName: 'Deleted User',
            email: 'deleted@example.com',
            password: defaultPassword,
            role: 'USER',
            status: 1,
            isDeleted: 1 // Soft deleted
        }
    ];
};

// Main seed function
const seedUsers = async () => {
    try {
        console.log('🌱 Starting user seeding process...');

        // Clear existing users (optional - remove in production)
        const existingCount = await User.countDocuments();
        if (existingCount > 0) {
            console.log(`🗑️  Found ${existingCount} existing users. Clearing...`);
            await User.deleteMany({});
            console.log('✅ Existing users cleared');
        }

        // Get user data
        console.log('👤 Generating user data...');
        const usersData = await getUsersData();

        // Insert users using insertMany for better performance
        console.log('📝 Inserting users into database...');
        const insertedUsers = await User.insertMany(usersData, {
            ordered: false // Continue inserting even if some fail
        });

        console.log(`✅ Successfully seeded ${insertedUsers.length} users`);

        // Calculate and display statistics
        const adminCount = insertedUsers.filter(user => user.role === 'ADMIN').length;
        const userCount = insertedUsers.filter(user => user.role === 'USER').length;
        const activeCount = insertedUsers.filter(user => user.status === 1 && user.isDeleted === 0).length;
        const inactiveCount = insertedUsers.filter(user => user.status === 0).length;
        const deletedCount = insertedUsers.filter(user => user.isDeleted === 1).length;

        // Display summary
        console.log('\n📊 User Statistics:');
        console.log('==================');
        console.log(`📈 Total Users: ${insertedUsers.length}`);
        console.log(`👑 Admins: ${adminCount}`);
        console.log(`👤 Regular Users: ${userCount}`);
        console.log(`✅ Active Users: ${activeCount}`);
        console.log(`❌ Inactive Users: ${inactiveCount}`);
        console.log(`🗑️  Soft Deleted: ${deletedCount}`);

        // Display login credentials
        console.log('\n🔑 Login Credentials:');
        console.log('====================');
        console.log('👑 Admin Accounts:');
        console.log('  📧 admin@ecommerce.com');
        console.log('  📧 manager@ecommerce.com');
        console.log('  📧 store.admin@ecommerce.com');
        console.log('  🔒 Password: admin123');
        console.log('');
        console.log('👤 User Accounts:');
        console.log('  📧 john.doe@example.com');
        console.log('  📧 jane.smith@example.com');
        console.log('  📧 demo@customer.com');
        console.log('  🔒 Password: password123');

        return insertedUsers;

    } catch (error) {
        console.error('❌ Error seeding users:', error);

        // Handle specific MongoDB errors
        if (error.code === 11000) {
            console.error('🔄 Duplicate key error - some users may already exist');
            const duplicateField = Object.keys(error.keyPattern)[0];
            console.error(`   Duplicate field: ${duplicateField}`);
        }

        throw error;
    }
};

// Utility function to verify seeded users
const verifyUsers = async () => {
    try {
        console.log('\n🔍 Verifying seeded users...');

        // Test login for admin
        const adminUser = await User.findOne({
            email: 'admin@ecommerce.com',
            role: 'ADMIN',
            status: 1,
            isDeleted: 0
        });

        if (adminUser) {
            console.log('✅ Admin user found and verified');
        } else {
            console.log('❌ Admin user not found');
        }

        // Test login for regular user
        const regularUser = await User.findOne({
            email: 'john.doe@example.com',
            role: 'USER',
            status: 1,
            isDeleted: 0
        });

        if (regularUser) {
            console.log('✅ Regular user found and verified');
        } else {
            console.log('❌ Regular user not found');
        }

        // Get total counts
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 1, isDeleted: 0 });

        console.log(`📊 Database contains ${totalUsers} total users (${activeUsers} active)`);

    } catch (error) {
        console.error('❌ Error verifying users:', error);
    }
};

// Main execution function when called directly
const runUserSeeder = async () => {
    try {
        await connectDB();
        await seedUsers();
        await verifyUsers();

        console.log('\n🎉 User seeding completed successfully!');
        console.log('🚀 You can now test the authentication endpoints');

    } catch (error) {
        console.error('\n💥 User seeding failed:', error.message);
        process.exit(1);
    } finally {
        // Close database connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('🔐 Database connection closed');
        }
        process.exit(0);
    }
};

// Export for use in master seeder
module.exports = {
    seedUsers,
    getUsersData,
    verifyUsers,
    connectDB
};

// Run seeder if called directly
if (require.main === module) {
    runUserSeeder();
}
