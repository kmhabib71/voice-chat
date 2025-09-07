/**
 * @fileoverview Database reset utility for fixing schema validation issues
 * @author AI Girlfriend Development Team
 * @created 2025-09-07
 * 
 * This script drops existing collections and recreates them with corrected schemas
 */

require('dotenv').config();
const { database, COLLECTIONS } = require('./lib/infrastructure/database');
const { createCollections } = require('./lib/infrastructure/database/models');

async function resetDatabase() {
    try {
        console.log('🗑️  Resetting Memory v2 database...');
        
        // Initialize database connection
        await database.initialize();
        const db = await database.getDatabase();
        
        console.log('📋 Listing existing collections...');
        const existingCollections = await db.listCollections().toArray();
        const collectionNames = existingCollections.map(col => col.name);
        
        console.log('Found collections:', collectionNames);
        
        // Drop existing memory collections if they exist
        const memoryCollections = [
            COLLECTIONS.SHORT_TERM_MEMORY,
            COLLECTIONS.LONG_TERM_MEMORY,
            COLLECTIONS.EPISODIC_MEMORY,
            COLLECTIONS.EMOTIONAL_STATE,
            COLLECTIONS.AI_PERSONALITY
        ];
        
        for (const collectionName of memoryCollections) {
            if (collectionNames.includes(collectionName)) {
                console.log(`🗑️  Dropping collection: ${collectionName}`);
                await db.collection(collectionName).drop();
            } else {
                console.log(`ℹ️  Collection ${collectionName} does not exist, skipping`);
            }
        }
        
        console.log('🔧 Recreating collections with updated schemas...');
        
        // Recreate collections with updated schemas
        await createCollections();
        
        console.log('✅ Database reset completed successfully!');
        console.log('🎯 Memory v2 system is ready for testing');
        
        // Test database connection
        console.log('🧪 Testing database connection...');
        const healthCheck = await database.performHealthCheck();
        console.log('Database health check:', healthCheck);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Database reset failed:', error);
        process.exit(1);
    }
}

// Run the reset
resetDatabase();