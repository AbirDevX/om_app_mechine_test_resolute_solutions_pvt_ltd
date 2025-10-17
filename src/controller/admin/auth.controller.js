const User = require('../../schema/User');
const { generateHashPassword, checkHashPassword } = require("../../service/hash/hash.service");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../../service/jwt/jwt.service");
const { HttpException } = require("../../utility/exception/httpException");

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin user specifically
        const admin = await User.findOne({
            email: email,
            role: 'ADMIN',
            status: 1,
            isDeleted: 0
        });

        if (!admin) {
            throw new HttpException(401, "Invalid admin credentials or unauthorized access");
        }

        // Check password
        const isPasswordValid = await checkHashPassword(password, admin.password);

        if (!isPasswordValid) {
            throw new HttpException(401, "Invalid admin credentials");
        }

        // Generate tokens with admin-specific payload
        const accessToken = await generateAccessToken(admin);
        const refreshToken = await generateRefreshToken(admin);

        // Update last login timestamp
        await User.findByIdAndUpdate(admin._id, {
            updatedAt: new Date()
        });

        // Admin response with enhanced data
        const adminResponse = {
            id: admin._id,
            fullName: admin.fullName,
            email: admin.email,
            role: admin.role,
            status: admin.status,
            createdAt: admin.createdAt,
            lastLoginAt: new Date()
        };

        return res.status(200).json({
            success: true,
            message: "Admin login successful",
            status_code: 200,
            data: {
                admin: adminResponse,
                tokens: {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    token_type: "Bearer",
                    expires_in: "24h"
                },
                login_time: new Date().toISOString()
            }
        });

    } catch (error) {
        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status,
            error: "admin_login_failed"
        });
    }
};