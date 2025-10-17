const { verifyAccessToken } = require('../../service/jwt/jwt.service');
const { USER_ROLE_ENUM } = require('../../utility/enum/enum');

const isAdminMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: "Unauthorized: No token provided", status_code: 401 });

        const response = await verifyAccessToken(token);
        if (!response.success) return res.status(401).json({ success: false, message: "Authorizations Failed. try again.!", status_code: 401 });
        if (response.data.role !== USER_ROLE_ENUM.ADMIN) return res.status(403).json({ success: false, message: "Unauthorized: access", status_code: 403 });
        req.user = response.data;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token", status_code: 401 });
    }
};

module.exports = isAdminMiddleware;