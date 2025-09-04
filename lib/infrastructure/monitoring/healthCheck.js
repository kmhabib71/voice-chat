/**
 * @fileoverview Database and system health monitoring
 * @created 2025-09-04
 * 
 * @example
 * const healthCheck = require('./healthCheck');
 * const health = await healthCheck.performDatabaseHealth();
 */

const { performHealthCheck, testReadWriteCapability } = require('../database/migrations');
const connection = require('../database/connection');

class HealthMonitor {
    constructor() {
        this.lastHealthCheck = null;
        this.healthCheckInterval = 30000; // 30 seconds
        this.isMonitoring = false;
    }

    /**
     * Performs comprehensive database health check
     * @returns {Promise<Object>} Health status information
     */
    async performDatabaseHealth() {
        const health = await performHealthCheck();
        this.lastHealthCheck = health;
        return health;
    }

    /**
     * Gets detailed system status
     * @returns {Promise<Object>} Detailed health information
     */
    async getDetailedStatus() {
        const [healthCheck, readWriteTest] = await Promise.all([
            this.performDatabaseHealth(),
            testReadWriteCapability()
        ]);

        return {
            ...healthCheck,
            capabilities: readWriteTest,
            connection: connection.getConnectionStatus(),
            monitoring: {
                isActive: this.isMonitoring,
                interval: this.healthCheckInterval,
                lastCheck: this.lastHealthCheck?.timestamp
            }
        };
    }

    /**
     * Starts health monitoring
     * @param {Function} callback - Optional callback for health updates
     */
    startMonitoring(callback = null) {
        if (this.isMonitoring) {
            console.log('Database health monitoring already active');
            return;
        }

        this.isMonitoring = true;
        console.log(`🩺 Starting database health monitoring (interval: ${this.healthCheckInterval}ms)`);

        this.monitoringInterval = setInterval(async () => {
            try {
                const health = await this.performDatabaseHealth();
                
                if (health.status !== 'healthy') {
                    console.warn('⚠️ Database health check warning:', {
                        status: health.status,
                        duration: health.duration,
                        errors: health.errors
                    });
                }

                if (callback && typeof callback === 'function') {
                    callback(health);
                }
                
            } catch (error) {
                console.error('❌ Health monitoring error:', error.message);
            }
        }, this.healthCheckInterval);
    }

    /**
     * Stops health monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) {
            return;
        }

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        this.isMonitoring = false;
        console.log('🩺 Database health monitoring stopped');
    }

    /**
     * Gets last health check result
     * @returns {Object|null} Last health check result
     */
    getLastHealthCheck() {
        return this.lastHealthCheck;
    }

    /**
     * Creates Express middleware for health endpoint
     * @returns {Function} Express middleware function
     */
    createHealthEndpoint() {
        return async (req, res) => {
            try {
                const detailed = req.query.detailed === 'true';
                const health = detailed 
                    ? await this.getDetailedStatus()
                    : await this.performDatabaseHealth();

                const statusCode = health.status === 'healthy' ? 200 : 
                                 health.status === 'degraded' ? 206 : 503;

                res.status(statusCode).json(health);

            } catch (error) {
                res.status(500).json({
                    status: 'error',
                    timestamp: new Date().toISOString(),
                    error: error.message
                });
            }
        };
    }
}

// Export singleton instance
module.exports = new HealthMonitor();