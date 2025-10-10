const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../../logs/');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for better error display
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        if (stack) {
            logMessage += `\n${stack}`;
        }
        
        if (Object.keys(meta).length > 0) {
            logMessage += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
        }
        
        return logMessage;
    })
);

// Create logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: {
        service: process.env.SERVICE_NAME || 'app',
        version: process.env.APP_VERSION || '1.0.0'
    },
    transports: [
        // Combined logs
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        
        // Error logs only
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ],
    
    // Handle uncaught exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'exceptions.log'),
            format: customFormat
        }),
        // Add console for immediate visibility
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            )
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'rejections.log'),
            format: customFormat
        }),
        // Add console for immediate visibility
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            )
        })
    ],
    
    // IMPORTANT: Set to false to prevent silent exits
    exitOnError: false
});

// Add console transport only in development or when explicitly enabled
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_CONSOLE_LOGS === 'true') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            customFormat
        )
    }));
}

// Enhanced error logging function
const logError = (message, error, context = {}) => {
    const errorInfo = {
        message: message,
        error: error?.message || error,
        stack: error?.stack,
        code: error?.code,
        statusCode: error?.statusCode || error?.status,
        ...context
    };
    
    logger.error(message, errorInfo);
    
    // Also log to console immediately for debugging
    console.error(`❌ ERROR: ${message}`, {
        error: error?.message || error,
        stack: error?.stack
    });
};

// Simple HTTP request middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Skip health checks and static files
    const skipPaths = ['/health', '/status', '/favicon.ico'];
    if (skipPaths.includes(req.path)) {
        return next();
    }
    
    // Log request
    logger.info('incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent')
    });
    
    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection?.remoteAddress
        };
        
        if (res.statusCode >= 500) {
            logger.error('server error', logData);
        } else if (res.statusCode >= 400) {
            logger.warn('client error', logData);
        } else {
            logger.info('request completed', logData);
        }
    });
    
    next();
};

const logInfo = (message, data = {}) => {
    logger.info(message, data);
    if (process.env.NODE_ENV === 'development') {
        console.log(`ℹ️  INFO: ${message}`, data);
    }
};

const logWarn = (message, data = {}) => {
    logger.warn(message, data);
    if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️  WARN: ${message}`, data);
    }
};

module.exports = {
    logger,
    requestLogger,
    logError,
    logInfo,
    logWarn
};
