/**
 * @fileoverview Database infrastructure module - unified interface
 * @created 2025-09-04
 * 
 * @example
 * const { initializeDatabase, COLLECTIONS } = require('./index');
 * await initializeDatabase();
 */

const connection = require('./connection');
const { COLLECTIONS, getCollection } = require('./models');
const { initializeDatabase, performHealthCheck, disconnect } = require('./migrations');

/**
 * Database manager class providing unified access
 */
class DatabaseManager {
    constructor() {
        this.connection = connection;
        this.initialized = false;
    }

    /**
     * Initialize database with collections and health check
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        if (this.initialized) {
            console.log('Database already initialized');
            return true;
        }

        await initializeDatabase();
        this.initialized = true;
        return true;
    }

    /**
     * Get database instance
     * @returns {Promise<Db>} MongoDB database
     */
    async getDatabase() {
        return await connection.getDatabase();
    }

    /**
     * Get collection by name
     * @param {string} collectionName - Collection name from COLLECTIONS
     * @returns {Promise<Collection>} MongoDB collection
     */
    async getCollection(collectionName) {
        return await getCollection(collectionName);
    }

    /**
     * Perform health check
     * @returns {Promise<Object>} Health status
     */
    async performHealthCheck() {
        return await performHealthCheck();
    }

    /**
     * Get connection status
     * @returns {Object} Connection information
     */
    getConnectionStatus() {
        return connection.getConnectionStatus();
    }

    /**
     * Disconnect from database
     * @returns {Promise<void>}
     */
    async disconnect() {
        await disconnect();
        this.initialized = false;
    }

    /**
     * Ensure database is ready for operations
     * @returns {Promise<boolean>} Ready status
     */
    async ensureReady() {
        if (!this.initialized) {
            await this.initialize();
        }
        
        const status = this.getConnectionStatus();
        if (!status.isConnected) {
            throw new Error('Database connection is not active');
        }
        
        return true;
    }
}

// Export singleton instance and utilities
const databaseManager = new DatabaseManager();

module.exports = {
    // Main database manager
    database: databaseManager,
    
    // Direct access to components
    connection,
    
    // Collection constants
    COLLECTIONS,
    
    // Convenience methods
    initializeDatabase: () => databaseManager.initialize(),
    getDatabase: () => databaseManager.getDatabase(), 
    getCollection: (name) => databaseManager.getCollection(name),
    performHealthCheck: () => databaseManager.performHealthCheck(),
    disconnect: () => databaseManager.disconnect(),
    ensureReady: () => databaseManager.ensureReady()
};