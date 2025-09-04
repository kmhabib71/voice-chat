/**
 * @fileoverview Database setup and migration utilities
 * @created 2025-09-04
 * 
 * @example
 * const { initializeDatabase } = require('./migrations');
 * await initializeDatabase();
 */

const connection = require('./connection');
const { createCollections, COLLECTIONS } = require('./models');

/**
 * Initializes database with all collections and indexes
 * @returns {Promise<boolean>} Success status
 */
async function initializeDatabase() {
    try {
        console.log('🚀 Initializing AI Girlfriend Memory Database...');

        // Step 1: Connect to MongoDB
        await connection.connect();
        
        // Step 2: Create all collections with schemas and indexes
        await createCollections();
        
        // Step 3: Verify setup
        const health = await performHealthCheck();
        
        if (health.status !== 'healthy') {
            throw new Error(`Database health check failed: ${health.status}`);
        }

        console.log('✅ Database initialization completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    }
}

/**
 * Performs database health check
 * @returns {Promise<Object>} Health status information
 */
async function performHealthCheck() {
    const startTime = Date.now();
    
    try {
        // Basic connection health
        const db = await connection.getDatabase();
        await db.admin().ping();
        
        // Test collections access
        const collectionsHealth = await _checkCollectionsHealth(db);
        
        // Calculate overall health
        const isHealthy = collectionsHealth.accessible >= collectionsHealth.total;
        
        const result = {
            status: isHealthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime,
            database: connection.getConnectionStatus().database,
            collections: collectionsHealth,
            performance: {
                responseTime: Date.now() - startTime,
                acceptableThreshold: 1000 // 1 second
            }
        };

        return result;

    } catch (error) {
        return {
            status: 'unhealthy',
            timestamp: new Date().toISOString(), 
            duration: Date.now() - startTime,
            error: error.message,
            performance: {
                responseTime: Date.now() - startTime,
                acceptableThreshold: 1000
            }
        };
    }
}

/**
 * Checks health of all collections
 * @private
 * @param {Db} db - Database instance
 * @returns {Promise<Object>} Collections health info
 */
async function _checkCollectionsHealth(db) {
    try {
        const healthResults = {
            total: Object.keys(COLLECTIONS).length,
            accessible: 0,
            details: {}
        };

        for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
            try {
                const collection = db.collection(collectionName);
                
                // Test basic operations
                const testStart = Date.now();
                await collection.countDocuments({}, { limit: 1 });
                const testDuration = Date.now() - testStart;
                
                healthResults.accessible++;
                healthResults.details[collectionName] = {
                    status: 'accessible',
                    responseTime: testDuration
                };
                
            } catch (error) {
                healthResults.details[collectionName] = {
                    status: 'error',
                    error: error.message
                };
            }
        }

        return healthResults;
        
    } catch (error) {
        return {
            total: 0,
            accessible: 0,
            details: {},
            error: error.message
        };
    }
}

/**
 * Tests read/write capabilities
 * @returns {Promise<Object>} Test results
 */
async function testReadWriteCapability() {
    try {
        const testDoc = {
            _id: 'health_check_test',
            timestamp: new Date(),
            purpose: 'database_health_test'
        };

        // Test write capability
        const collection = await connection.getCollection('health_test');
        await collection.replaceOne(
            { _id: testDoc._id },
            testDoc,
            { upsert: true }
        );

        // Test read capability
        const retrievedDoc = await collection.findOne({ _id: testDoc._id });
        
        // Cleanup
        await collection.deleteOne({ _id: testDoc._id });

        return {
            status: 'success',
            canRead: !!retrievedDoc,
            canWrite: true,
            canDelete: true
        };

    } catch (error) {
        return {
            status: 'error',
            error: error.message,
            canRead: false,
            canWrite: false,
            canDelete: false
        };
    }
}

/**
 * Disconnects from database
 * @returns {Promise<void>}
 */
async function disconnect() {
    return await connection.disconnect();
}

module.exports = {
    initializeDatabase,
    performHealthCheck,
    testReadWriteCapability,
    disconnect
};