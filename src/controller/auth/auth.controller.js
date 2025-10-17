const User = require('../../schema/User'); // Import your Mongoose User model
const { generateHashPassword, checkHashPassword } = require("../../service/hash/hash.service");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../../service/jwt/jwt.service");
const { USER_ROLE_ENUM } = require('../../utility/enum/enum');
const { HttpException } = require("../../utility/exception/httpException");


exports.register = async (req, res) => {
    try {
        const payload = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $and: [
                {
                    $or: [
                        { email: payload?.email }
                    ]
                },
                { isDeleted: 0 }
            ]
        });

        if (existingUser) {
            throw new HttpException(409, `Email already exists`);
        }

        // Hash password
        const hashedPassword = await generateHashPassword(payload?.password);

        // Create user
        const newUser = await User.create({
            fullName: payload?.full_name,
            email: payload?.email,
            password: hashedPassword,
            role: USER_ROLE_ENUM.USER,
            status: 1,
            isDeleted: 0
        });

        // Generate tokens
        const accessToken = await generateAccessToken(newUser);
        const refreshToken = await generateRefreshToken(newUser);

        // Remove password from response
        const userResponse = {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status,
            createdAt: newUser.createdAt
        };

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            status_code: 201,
            data: {
                user: userResponse,
                tokens: {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    token_type: "Bearer",
                    expires_in: "24h"
                }
            }
        });

    } catch (error) {
        // Handle MongoDB duplicate key error
        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        whereCondition = {
            email: identifier,
            status: 1,
            isDeleted: 0
        };

        // Find user
        const user = await User.findOne(whereCondition);

        if (!user) {
            throw new HttpException(401, "Invalid credentials");
        }

        // Check password
        const isPasswordValid = await checkHashPassword(password, user.password);

        if (!isPasswordValid) {
            throw new HttpException(401, "Invalid credentials");
        }

        // Generate tokens
        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        // Update last login (optional)
        await User.findByIdAndUpdate(user._id, {
            updatedAt: new Date()
        });

        // Remove password from response
        const userResponse = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: new Date()
        };

        return res.status(200).json({
            success: true,
            message: "Login successful",
            status_code: 200,
            data: {
                user: userResponse,
                tokens: {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    token_type: "Bearer",
                    expires_in: "24h"
                }
            }
        });

    } catch (error) {
        const status = error?.status || 500;
        const message = error?.message || "INTERNAL_SERVER_ERROR";

        return res.status(status).json({
            success: false,
            message,
            status_code: status
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required",
                status_code: 401,
                error: "refresh_token_required"
            });
        }

        // Verify refresh token
        const tokenResult = await verifyRefreshToken(refresh_token);

        if (!tokenResult.success) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
                status_code: 401,
                error: "invalid_refresh_token"
            });
        }

        // Find user by MongoDB ObjectId
        const user = await User.findOne({
            _id: tokenResult.data.sub,
            status: 1,
            isDeleted: 0
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
                status_code: 401,
                error: "user_not_found"
            });
        }

        // Generate new tokens
        const newAccessToken = await generateAccessToken(user);
        const newRefreshToken = await generateRefreshToken(user);

        return res.status(200).json({
            success: true,
            message: "Tokens refreshed successfully",
            status_code: 200,
            data: {
                tokens: {
                    access_token: newAccessToken,
                    refresh_token: newRefreshToken,
                    token_type: "Bearer",
                    expires_in: "24h"
                }
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "INTERNAL_SERVER_ERROR",
            status_code: 500
        });
    }
};

exports.logout = async (req, res) => {
    try {
        // In a production app, you'd typically blacklist the token
        // or store it in a revoked tokens list

        return res.status(200).json({
            success: true,
            message: "Logout successful",
            status_code: 200
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "INTERNAL_SERVER_ERROR",
            status_code: 500
        });
    }
};
