const os = require('os');
const pkg = require('../../package.json');
const connectToMongoDb = require("../config/mongo.config");

exports.healthCheck = async (req, res) => {
    try {
        const startTime = Date.now();
        
        // Basic system information
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: pkg.version || '1.0.0',
            service: process.env.SERVICE_NAME || 'order-management-api',
            server: {
                port: process.env.PORT || 8080,
                url: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 8080}`
            },
            system: {
                platform: os.platform(),
                arch: os.arch(),
                nodeVersion: process.version,
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
                    system: Math.round(os.totalmem() / 1024 / 1024) + ' MB',
                    free: Math.round(os.freemem() / 1024 / 1024) + ' MB'
                },
                cpu: {
                    cores: os.cpus().length,
                    loadAverage: os.loadavg()
                }
            },
            checks: {},
            responseTime: null
        };
        
        // Database health check
        try {
            await connectToMongoDb();
            healthData.checks.database = {
                status: 'up',
                message: 'Database connection successful',
                responseTime: Date.now() - startTime + 'ms'
            };
        } catch (dbError) {
            healthData.status = 'degraded';
            healthData.checks.database = {
                status: 'down',
                message: 'Database connection failed',
                error: dbError.message,
                responseTime: Date.now() - startTime + 'ms'
            };
        }
        
        // Memory usage check
        const memoryUsage = process.memoryUsage();
        const memoryThreshold = 90; // 90% memory usage threshold
        const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
        
        healthData.checks.memory = {
            status: memoryUsagePercent > memoryThreshold ? 'warning' : 'up',
            usage: Math.round(memoryUsagePercent) + '%',
            message: memoryUsagePercent > memoryThreshold ? 
                'High memory usage detected' : 'Memory usage normal'
        };
        
        // Disk space check (simplified)
        healthData.checks.diskSpace = {
            status: 'up',
            message: 'Disk space check not implemented'
        };
        
        // Process health check
        healthData.checks.process = {
            status: 'up',
            pid: process.pid,
            uptime: Math.floor(process.uptime()) + ' seconds',
            message: 'Process running normally'
        };
        
        // External services check placeholder
        healthData.checks.externalServices = {
            status: 'up',
            message: 'No external services configured'
        };
        
        // Calculate total response time
        healthData.responseTime = (Date.now() - startTime) + 'ms';
        
        // Determine overall status
        const checkStatuses = Object.values(healthData.checks).map(check => check.status);
        if (checkStatuses.includes('down')) {
            healthData.status = 'unhealthy';
        } else if (checkStatuses.includes('warning')) {
            healthData.status = 'degraded';
        }
        
        // Set response status based on health status
        const statusCode = healthData.status === 'healthy' ? 200 :
                          healthData.status === 'degraded' ? 200 :
                          503;
        
        
        return res.status(statusCode).json(healthData);
        
    } catch (error) {
        
        return res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            message: 'Health check failed',
            error: error.message,
            uptime: process.uptime()
        });
    }
};

