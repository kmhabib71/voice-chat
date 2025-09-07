/**
 * @fileoverview MongoDB collection models and schema definitions
 * @created 2025-09-04
 * 
 * @example
 * const { COLLECTIONS, createCollections } = require('./models');
 * await createCollections();
 */

const connection = require('./connection');

// Collection name constants
const COLLECTIONS = {
    SHORT_TERM_MEMORY: 'short_term_memory',
    LONG_TERM_MEMORY: 'long_term_memory', 
    EPISODIC_MEMORY: 'episodic_memory',
    EMOTIONAL_STATE: 'emotional_state',
    AI_PERSONALITY: 'ai_personality'
};

/**
 * Creates all database collections with proper schemas and indexes
 * @returns {Promise<boolean>} Success status
 */
async function createCollections() {
    try {
        const db = await connection.getDatabase();
        console.log('🔧 Creating database collections...');

        await Promise.all([
            _createShortTermMemoryCollection(db),
            _createLongTermMemoryCollection(db),
            _createEpisodicMemoryCollection(db),
            _createEmotionalStateCollection(db),
            _createAIPersonalityCollection(db)
        ]);

        console.log('✅ All collections created successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Error creating collections:', error);
        throw error;
    }
}

/**
 * Creates short-term memory collection with TTL index
 * @private
 */
async function _createShortTermMemoryCollection(db) {
    const collectionName = COLLECTIONS.SHORT_TERM_MEMORY;
    
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
        await db.createCollection(collectionName, {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["userId", "sessionId", "messages", "expiresAt"],
                    properties: {
                        userId: { bsonType: "string" },
                        sessionId: { bsonType: "string" },
                        messages: { bsonType: "array" },
                        currentMood: { bsonType: ["string", "null"] },
                        activeTopics: { bsonType: "array" },
                        messageCount: { bsonType: "number" },
                        createdAt: { bsonType: "date" },
                        expiresAt: { bsonType: "date" }
                    },
                    additionalProperties: true // Allow additional fields for flexibility
                }
            }
        });
    }

    const collection = db.collection(collectionName);
    await Promise.all([
        collection.createIndex({ userId: 1, sessionId: 1 }),
        collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }), // TTL index
        collection.createIndex({ userId: 1, createdAt: -1 })
    ]);

    console.log(`✅ ${collectionName} collection created with TTL index`);
}

/**
 * Creates long-term memory collection with compound indexes
 * @private  
 */
async function _createLongTermMemoryCollection(db) {
    const collectionName = COLLECTIONS.LONG_TERM_MEMORY;
    
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
        await db.createCollection(collectionName, {
            validator: {
                $jsonSchema: {
                    bsonType: "object", 
                    required: ["userId", "category", "key", "value"],
                    properties: {
                        userId: { bsonType: "string" },
                        category: { 
                            bsonType: "string",
                            enum: ["personal_facts", "preferences", "goals", "milestones"]
                        },
                        key: { bsonType: "string" },
                        value: { bsonType: "string" },
                        confidence: { bsonType: "number", minimum: 0, maximum: 1 },
                        importance: { 
                            bsonType: "string",
                            enum: ["low", "medium", "high"]
                        },
                        firstMentioned: { bsonType: "date" },
                        lastConfirmed: { bsonType: "date" },
                        contexts: { bsonType: "array" }
                    },
                    additionalProperties: true // Allow additional fields for flexibility
                }
            }
        });
    }

    const collection = db.collection(collectionName);
    await Promise.all([
        collection.createIndex({ userId: 1, category: 1 }),
        collection.createIndex({ userId: 1, key: 1 }, { unique: true }),
        collection.createIndex({ userId: 1, importance: 1 }),
        collection.createIndex({ userId: 1, lastConfirmed: -1 })
    ]);

    console.log(`✅ ${collectionName} collection created with compound indexes`);
}

/**
 * Creates episodic memory collection with vector search preparation
 * @private
 */
async function _createEpisodicMemoryCollection(db) {
    const collectionName = COLLECTIONS.EPISODIC_MEMORY;
    
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
        await db.createCollection(collectionName, {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["userId", "date", "summary"],
                    properties: {
                        userId: { bsonType: "string" },
                        date: { bsonType: "string" },
                        summary: { bsonType: "string" },
                        primaryEmotion: { bsonType: "string" },
                        topics: { bsonType: "array" },
                        importance: { 
                            bsonType: "string",
                            enum: ["low", "medium", "high"]
                        },
                        vectorEmbedding: { bsonType: "array" },
                        conversationLength: { bsonType: "number" },
                        createdAt: { bsonType: "date" }
                    },
                    additionalProperties: true // Allow additional fields for flexibility
                }
            }
        });
    }

    const collection = db.collection(collectionName);
    await Promise.all([
        collection.createIndex({ userId: 1, date: -1 }),
        collection.createIndex({ userId: 1, importance: 1 }),
        collection.createIndex({ userId: 1, createdAt: -1 }),
        collection.createIndex({ userId: 1, topics: 1 })
    ]);

    console.log(`✅ ${collectionName} collection created (vector search index required)`);
}

/**
 * Creates emotional state collection
 * @private
 */
async function _createEmotionalStateCollection(db) {
    const collectionName = COLLECTIONS.EMOTIONAL_STATE;
    
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
        await db.createCollection(collectionName, {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["userId"],
                    properties: {
                        userId: { bsonType: "string" },
                        currentEmotion: { bsonType: "string" },
                        baselineEmotion: { bsonType: "string" },
                        relationshipDepth: { 
                            bsonType: "string",
                            enum: ["superficial", "developing", "deep", "intimate"]
                        },
                        affectionLevel: { bsonType: "number", minimum: 0, maximum: 1 },
                        trustLevel: { bsonType: "number", minimum: 0, maximum: 1 },
                        conversationFrequency: { 
                            bsonType: "string",
                            enum: ["rare", "occasional", "regular", "frequent", "constant"]
                        },
                        emotionalHistory: { bsonType: "array" },
                        lastUpdated: { bsonType: "date" }
                    }
                }
            }
        });
    }

    const collection = db.collection(collectionName);
    await Promise.all([
        collection.createIndex({ userId: 1 }, { unique: true }),
        collection.createIndex({ lastUpdated: -1 }),
        collection.createIndex({ relationshipDepth: 1 })
    ]);

    console.log(`✅ ${collectionName} collection created with unique userId index`);
}

/**
 * Creates AI personality collection
 * @private
 */
async function _createAIPersonalityCollection(db) {
    const collectionName = COLLECTIONS.AI_PERSONALITY;
    
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
        await db.createCollection(collectionName, {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["userId", "name"],
                    properties: {
                        userId: { bsonType: "string" },
                        name: { bsonType: "string" },
                        backstory: { bsonType: "string" },
                        traits: { bsonType: "array" },
                        relationshipRole: { 
                            bsonType: "string",
                            enum: ["friend", "companion", "girlfriend", "mentor"]
                        },
                        humorStyle: { bsonType: "string" },
                        responsePatterns: { bsonType: "object" },
                        memoryOfUser: { bsonType: "object" }
                    }
                }
            }
        });
    }

    const collection = db.collection(collectionName);
    await Promise.all([
        collection.createIndex({ userId: 1 }, { unique: true }),
        collection.createIndex({ relationshipRole: 1 })
    ]);

    console.log(`✅ ${collectionName} collection created with unique userId index`);
}

/**
 * Gets a collection by name
 * @param {string} collectionName - Collection name from COLLECTIONS constant
 * @returns {Promise<Collection>} MongoDB collection
 */
async function getCollection(collectionName) {
    return await connection.getCollection(collectionName);
}

/**
 * Lists all collections
 * @returns {Promise<Array>} Collection information
 */
async function listCollections() {
    try {
        const db = await connection.getDatabase();
        const collections = await db.listCollections().toArray();
        
        return collections.map(col => ({
            name: col.name,
            type: col.type,
            options: col.options
        }));
        
    } catch (error) {
        console.error('Error listing collections:', error);
        throw error;
    }
}

module.exports = {
    COLLECTIONS,
    createCollections,
    getCollection,
    listCollections
};