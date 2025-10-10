const { User } = require("../../models");
const { generateHashPassword, checkHashPassword } = require("../../service/hash/hash.service");
const { generateAccessToken, generateRefreshToken } = require("../../service/jwt/jwt.service");
const { HttpException } = require("../../utility/exception/httpException");
const { Op } = require('sequelize');
const { logError } = require("../../utility/logger/logger.utility");

exports.register = async (req, res) => {
    try {
        const { full_name, username, email, mobile, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { username: username },
                    ...(mobile ? [{ mobile: mobile }] : [])
                ],
                is_deleted: 0
            }
        });

        if (existingUser) {
            let conflictField = '';
            if (existingUser.email === email) conflictField = 'Email';
            else if (existingUser.username === username) conflictField = 'Username';
            else if (existingUser.mobile === mobile) conflictField = 'Mobile';

            throw new HttpException(409, `${conflictField} already exists`);
        }

        // Hash password
        const hashedPassword = await generateHashPassword(password);

        // Create user
        const newUser = await User.create({
            full_name,
            username,
            email,
            mobile: mobile || null,
            password: hashedPassword,
            status: 1,
            is_deleted: 0
        });

        // Generate tokens
        const accessToken = await generateAccessToken(newUser);
        const refreshToken = await generateRefreshToken(newUser);

        // Remove password from response
        const userResponse = {
            id: newUser.id,
            full_name: newUser.full_name,
            username: newUser.username,
            email: newUser.email,
            mobile: newUser.mobile,
            status: newUser.status,
            created_at: newUser.created_at
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
        logError("User Registration", error?.message);

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

        // Check if identifier is email or username
        const isEmail = identifier.includes('@');
        const whereCondition = {
            [isEmail ? 'email' : 'username']: identifier,
            status: 1,
            is_deleted: 0
        };

        // Find user
        const user = await User.findOne({
            where: whereCondition
        });

        if (!user) throw new HttpException(400, "Invalid credentials");

        // Check password
        const isPasswordValid = await checkHashPassword(password, user.password);

        if (!isPasswordValid) throw new HttpException(401, "Invalid credentials");

        // Generate tokens
        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        // Update last login (optional)
        await user.update({
            updated_at: new Date()
        });

        // Remove password from response
        const userResponse = {
            id: user.id,
            full_name: user.full_name,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            status: user.status,
            created_at: user.created_at,
            updated_at: user.updated_at
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
        logError("User Login", error?.message);

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

        // Find user
        const user = await User.findByPk(tokenResult.data.sub, {
            where: {
                status: 1,
                is_deleted: 0
            }
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
        logError("Token Refresh", error?.message);

        return res.status(500).json({
            success: false,
            message: "INTERNAL_SERVER_ERROR",
            status_code: 500
        });
    }
};
