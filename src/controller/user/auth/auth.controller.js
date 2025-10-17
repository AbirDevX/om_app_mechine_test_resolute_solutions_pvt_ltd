const User = require('../../../schema/User'); // Import your Mongoose User model
const { generateHashPassword, checkHashPassword } = require("../../../service/hash/hash.service");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../../../service/jwt/jwt.service");
const { USER_ROLE_ENUM } = require('../../../utility/enum/enum');
const { HttpException } = require("../../../utility/exception/httpException");


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