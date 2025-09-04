/**
 * @fileoverview MongoDB Atlas connection management with connection pooling
 * @created 2025-09-04
 * 
 * @example
 * const connection = require('./connection');
 * const db = await connection.getDatabase();
 */

const { MongoClient } = require('mongodb');

class DatabaseConnection {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
        this.connectionPromise = null;
        
        // Connection configuration
        this.config = {
            uri: process.env.MONGODB_URI,
            dbName: process.env.MONGODB_DB_NAME || 'ai_girlfriend_memory',
            options: {
                minPoolSize: 5,
                maxPoolSize: 50,
                maxIdleTimeMS: 30000,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                retryWrites: true,
                w: 'majority'
            }
        };

        if (!this.config.uri) {
            throw new Error('MONGODB_URI environment variable is required');
        }
    }

    /**
     * Establishes connection to MongoDB Atlas
     * @returns {Promise<Db>} MongoDB database instance
     * @throws {Error} Connection failed
     */
    async connect() {
        if (this.isConnected && this.client) {
            return this.db;
        }

        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = this._establishConnection();
        return this.connectionPromise;
    }

    async _establishConnection() {
        try {
            console.log('🔌 Connecting to MongoDB Atlas...');
            
            this.client = new MongoClient(this.config.uri, this.config.options);
            await this.client.connect();
            
            this.db = this.client.db(this.config.dbName);
            this.isConnected = true;
            
            // Test the connection
            await this.db.admin().ping();
            
            console.log(`✅ Connected to database: ${this.config.dbName}`);
            
            // Setup event listeners
            this._setupEventListeners();
            
            return this.db;
            
        } catch (error) {
            console.error('❌ MongoDB connection error:', error.message);
            this.isConnected = false;
            this.connectionPromise = null;
            throw error;
        }
    }

    _setupEventListeners() {
        if (!this.client) return;

        this.client.on('serverClosed', () => {
            console.log('MongoDB server connection closed');
            this.isConnected = false;
        });

        this.client.on('error', (error) => {
            console.error('MongoDB client error:', error);
            this.isConnected = false;
        });
    }

    /**
     * Closes database connection
     * @returns {Promise<void>}
     */
    async disconnect() {
        try {
            if (this.client) {
                await this.client.close();
                console.log('🔌 MongoDB connection closed');
            }
        } catch (error) {
            console.error('Error closing MongoDB connection:', error);
        } finally {
            this.client = null;
            this.db = null;
            this.isConnected = false;
            this.connectionPromise = null;
        }
    }

    /**
     * Gets database instance, connecting if necessary
     * @returns {Promise<Db>} MongoDB database instance
     */
    async getDatabase() {
        if (!this.isConnected || !this.db) {
            await this.connect();
        }
        return this.db;
    }

    /**
     * Gets collection from database
     * @param {string} collectionName - Name of collection
     * @returns {Promise<Collection>} MongoDB collection
     */
    async getCollection(collectionName) {
        const db = await this.getDatabase();
        return db.collection(collectionName);
    }

    /**
     * Gets connection status
     * @returns {Object} Connection status info
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            database: this.config.dbName,
            hasClient: !!this.client
        };
    }
}

// Export singleton instance
const databaseConnection = new DatabaseConnection();

// Graceful shutdown handlers
process.on('SIGINT', async () => {
    await databaseConnection.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await databaseConnection.disconnect();
    process.exit(0);
});

module.exports = databaseConnection;