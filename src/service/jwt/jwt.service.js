const jwt = require('jsonwebtoken');

exports.generateAccessToken = async (user) => {
    const payload = {
        sub: user.id,
        created_at: user.created_at,
    };

    const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
    const options = { expiresIn: '24h' };

    return await jwt.sign(payload, secret, options);
};
exports.generateRefreshToken = async (user) => {
    const payload = {
        sub: user.id,
        created_at: user.created_at,
    };

    const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
    const options = { expiresIn: '30d' };

    return jwt.sign(payload, secret, options);
};

exports.verifyAccessToken = async (token) => {
    const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
    try {
        const decoded = await jwt.verify(token, secret);
        return { success: true, data: decoded };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
exports.verifyRefreshToken = async (token) => {
    const secret = process.env.JWT_REFRESH_TOKEN_SECRET;
    try {
        const decoded = jwt.verify(token, secret);
        return { success: true, data: decoded };
    } catch (error) {
        return { success: false, error: error.message };
    }
}