// EcoChain Backend Server
// File: server.js

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Configuration
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ecochain-dna-secret-key-2025';
const BLOCKCHAIN_DIFFICULTY = 4;

// In-memory databases (dalam produksi gunakan MongoDB/PostgreSQL)
let blockchain = [];
let dnaProfiles = new Map();
let users = new Map();
let medicalRecords = new Map();
let foodTraceability = new Map();
let bioNodes = new Map();

// ==================== DNA UTILITIES ====================

class DNAProcessor {
    static generateDNAHash(dnaSequence) {
        // Simulasi proses hashing DNA sequence
        const salt = crypto.randomBytes(32).toString('hex');
        const hash = crypto.createHash('sha256')
            .update(dnaSequence + salt)
            .digest('hex');
        
        return {
            hash,
            salt,
            timestamp: Date.now(),
            verified: true
        };
    }

    static validateDNASequence(sequence) {
        // Validasi format DNA sequence (A, T, G, C)
        const dnaPattern = /^[ATGC]+$/;
        return dnaPattern.test(sequence) && sequence.length >= 100;
    }

    static generateGeneticFingerprint(dnaHash) {
        // Membuat fingerprint unik dari DNA hash
        return crypto.createHash('md5').update(dnaHash).digest('hex').substring(0, 16);
    }

    static simulateDNAMutation(originalDNA) {
        // Simulasi mutasi DNA minor
        const mutationRate = 0.001; // 0.1% chance per nucleotide
        let mutatedDNA = originalDNA;
        
        for (let i = 0; i < originalDNA.length; i++) {
            if (Math.random() < mutationRate) {
                const nucleotides = ['A', 'T', 'G', 'C'];
                const currentNucleotide = originalDNA[i];
                const newNucleotides = nucleotides.filter(n => n !== currentNucleotide);
                mutatedDNA = mutatedDNA.substring(0, i) + 
                           newNucleotides[Math.floor(Math.random() * newNucleotides.length)] + 
                           mutatedDNA.substring(i + 1);
            }
        }
        
        return mutatedDNA;
    }
}

// ==================== BLOCKCHAIN IMPLEMENTATION ====================

class EcoBlock {
    constructor(index, previousHash, timestamp, data, dnaHash) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.dnaHash = dnaHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
        this.geneticFingerprint = DNAProcessor.generateGeneticFingerprint(dnaHash);
    }

    calculateHash() {
        return crypto.createHash('sha256')
            .update(this.index + this.previousHash + this.timestamp + 
                   JSON.stringify(this.data) + this.dnaHash + this.nonce)
            .digest('hex');
    }

    mineBlock(difficulty) {
        const target = Array(difficulty + 1).join("0");
        
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log(`Block mined: ${this.hash}`);
        return this.hash;
    }
}

class EcoChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = BLOCKCHAIN_DIFFICULTY;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        const genesisData = {
            type: 'genesis',
            message: 'EcoChain Genesis Block - Blockchain Biologis',
            creator: 'EcoChain Foundation'
        };
        
        const genesisDNA = 'ATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGC'; // Sample DNA
        const dnaHash = DNAProcessor.generateDNAHash(genesisDNA);
        
        return new EcoBlock(0, "0", Date.now(), genesisData, dnaHash.hash);
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
        
        // Broadcast to all connected nodes
        this.broadcastBlock(newBlock);
    }

    broadcastBlock(block) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'NEW_BLOCK',
                    block: block
                }));
            }
        });
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// Initialize blockchain
const ecoChain = new EcoChain();

// ==================== PROOF OF GENETICS CONSENSUS ====================

class ProofOfGenetics {
    static validateGenetics(dnaHash, blockData) {
        // Simulasi validasi genetik
        const geneticComplexity = this.calculateGeneticComplexity(dnaHash);
        const requiredComplexity = 0.7; // 70% genetic diversity required
        
        return geneticComplexity >= requiredComplexity;
    }

    static calculateGeneticComplexity(dnaHash) {
        // Hitung kompleksitas genetik dari hash
        const uniqueChars = new Set(dnaHash).size;
        const entropy = uniqueChars / dnaHash.length;
        return entropy;
    }

    static selectValidator(availableNodes) {
        // Pilih validator berdasarkan diversitas genetik
        let maxDiversity = 0;
        let selectedNode = null;

        availableNodes.forEach(node => {
            const diversity = this.calculateGeneticComplexity(node.dnaHash);
            if (diversity > maxDiversity) {
                maxDiversity = diversity;
                selectedNode = node;
            }
        });

        return selectedNode;
    }
}

// ==================== API ROUTES ====================

// User Registration with DNA
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, dnaSequence } = req.body;

        // Validate DNA sequence
        if (!DNAProcessor.validateDNASequence(dnaSequence)) {
            return res.status(400).json({
                error: 'Invalid DNA sequence format'
            });
        }

        // Check if user exists
        if (users.has(email)) {
            return res.status(400).json({
                error: 'User already exists'
            });
        }

        // Generate DNA hash
        const dnaData = DNAProcessor.generateDNAHash(dnaSequence);
        const geneticFingerprint = DNAProcessor.generateGeneticFingerprint(dnaData.hash);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const userId = crypto.randomUUID();
        const user = {
            id: userId,
            username,
            email,
            password: hashedPassword,
            dnaHash: dnaData.hash,
            geneticFingerprint,
            createdAt: new Date(),
            verified: false
        };

        users.set(email, user);
        dnaProfiles.set(geneticFingerprint, {
            userId,
            dnaHash: dnaData.hash,
            salt: dnaData.salt,
            verified: dnaData.verified,
            createdAt: new Date()
        });

        // Create blockchain entry
        const blockData = {
            type: 'USER_REGISTRATION',
            userId,
            geneticFingerprint,
            timestamp: Date.now()
        };

        const newBlock = new EcoBlock(
            ecoChain.chain.length,
            ecoChain.getLatestBlock().hash,
            Date.now(),
            blockData,
            dnaData.hash
        );

        ecoChain.addBlock(newBlock);

        // Generate JWT
        const token = jwt.sign(
            { userId, geneticFingerprint },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: userId,
                username,
                email,
                geneticFingerprint
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User Login with Genetic Verification
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, dnaSequence } = req.body;

        // Find user
        const user = users.get(email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Verify DNA (allow for minor mutations)
        const providedDNAHash = DNAProcessor.generateDNAHash(dnaSequence);
        const storedProfile = dnaProfiles.get(user.geneticFingerprint);
        
        // Simulate DNA comparison allowing for mutations
        const dnaMatch = this.compareDNAWithMutations(
            providedDNAHash.hash, 
            storedProfile.dnaHash
        );

        if (!dnaMatch) {
            return res.status(400).json({ error: 'Genetic verification failed' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, geneticFingerprint: user.geneticFingerprint },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                geneticFingerprint: user.geneticFingerprint
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Medical Record Management
app.post('/api/medical/record', authenticateToken, (req, res) => {
    try {
        const { diagnosis, treatment, medications, notes } = req.body;
        const userId = req.user.userId;

        const recordId = crypto.randomUUID();
        const medicalRecord = {
            id: recordId,
            userId,
            diagnosis,
            treatment,
            medications,
            notes,
            timestamp: new Date(),
            geneticFingerprint: req.user.geneticFingerprint
        };

        medicalRecords.set(recordId, medicalRecord);

        // Add to blockchain
        const blockData = {
            type: 'MEDICAL_RECORD',
            recordId,
            userId,
            diagnosis: diagnosis.substring(0, 50) + '...', // Partial data for privacy
            timestamp: Date.now()
        };

        const user = Array.from(users.values()).find(u => u.id === userId);
        const newBlock = new EcoBlock(
            ecoChain.chain.length,
            ecoChain.getLatestBlock().hash,
            Date.now(),
            blockData,
            user.dnaHash
        );

        ecoChain.addBlock(newBlock);

        res.status(201).json({
            message: 'Medical record added successfully',
            recordId,
            blockHash: newBlock.hash
        });

    } catch (error) {
        console.error('Medical record error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Food Traceability
app.post('/api/food/trace', authenticateToken, (req, res) => {
    try {
        const { productName, origin, dnaSequence, productionDate, farmerId } = req.body;

        if (!DNAProcessor.validateDNASequence(dnaSequence)) {
            return res.status(400).json({ error: 'Invalid product DNA sequence' });
        }

        const traceId = crypto.randomUUID();
        const productDNA = DNAProcessor.generateDNAHash(dnaSequence);

        const traceRecord = {
            id: traceId,
            productName,
            origin,
            productDNA: productDNA.hash,
            productionDate,
            farmerId,
            createdBy: req.user.userId,
            timestamp: new Date(),
            verified: true
        };

        foodTraceability.set(traceId, traceRecord);

        // Add to blockchain
        const blockData = {
            type: 'FOOD_TRACEABILITY',
            traceId,
            productName,
            origin,
            farmerId,
            timestamp: Date.now()
        };

        const newBlock = new EcoBlock(
            ecoChain.chain.length,
            ecoChain.getLatestBlock().hash,
            Date.now(),
            blockData,
            productDNA.hash
        );

        ecoChain.addBlock(newBlock);

        res.status(201).json({
            message: 'Food trace record created successfully',
            traceId,
            productFingerprint: DNAProcessor.generateGeneticFingerprint(productDNA.hash),
            blockHash: newBlock.hash
        });

    } catch (error) {
        console.error('Food trace error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Blockchain Data
app.get('/api/blockchain', (req, res) => {
    res.json({
        chain: ecoChain.chain,
        length: ecoChain.chain.length,
        isValid: ecoChain.isChainValid(),
        difficulty: ecoChain.difficulty
    });
});

// Get User Profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
    try {
        const user = Array.from(users.values()).find(u => u.id === req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const dnaProfile = dnaProfiles.get(user.geneticFingerprint);
        const userMedicalRecords = Array.from(medicalRecords.values())
            .filter(record => record.userId === user.id);

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                geneticFingerprint: user.geneticFingerprint,
                createdAt: user.createdAt
            },
            dnaProfile: {
                verified: dnaProfile.verified,
                createdAt: dnaProfile.createdAt
            },
            medicalRecords: userMedicalRecords.length,
            blockchainEntries: ecoChain.chain.filter(block => 
                block.data.userId === user.id
            ).length
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Node Registration for Bio-Nodes
app.post('/api/node/register', (req, res) => {
    try {
        const { nodeId, location, capabilities, dnaSequence } = req.body;

        if (!DNAProcessor.validateDNASequence(dnaSequence)) {
            return res.status(400).json({ error: 'Invalid node DNA sequence' });
        }

        const nodeDNA = DNAProcessor.generateDNAHash(dnaSequence);
        const nodeInfo = {
            id: nodeId,
            location,
            capabilities,
            dnaHash: nodeDNA.hash,
            geneticComplexity: ProofOfGenetics.calculateGeneticComplexity(nodeDNA.hash),
            status: 'active',
            registeredAt: new Date()
        };

        bioNodes.set(nodeId, nodeInfo);

        res.status(201).json({
            message: 'Bio-node registered successfully',
            nodeId,
            geneticComplexity: nodeInfo.geneticComplexity,
            status: 'active'
        });

    } catch (error) {
        console.error('Node registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Analytics Dashboard
app.get('/api/analytics', (req, res) => {
    try {
        const totalUsers = users.size;
        const totalBlocks = ecoChain.chain.length;
        const totalMedicalRecords = medicalRecords.size;
        const totalFoodTraces = foodTraceability.size;
        const totalBioNodes = bioNodes.size;

        // Calculate genetic diversity
        const allDNAHashes = Array.from(dnaProfiles.values()).map(p => p.dnaHash);
        const avgGeneticComplexity = allDNAHashes.reduce((sum, hash) => 
            sum + ProofOfGenetics.calculateGeneticComplexity(hash), 0
        ) / allDNAHashes.length || 0;

        res.json({
            totalUsers,
            totalBlocks,
            totalMedicalRecords,
            totalFoodTraces,
            totalBioNodes,
            avgGeneticComplexity: avgGeneticComplexity.toFixed(4),
            blockchainHealth: ecoChain.isChainValid() ? 'Healthy' : 'Corrupted',
            networkStatus: 'Active'
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== MIDDLEWARE ====================

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// DNA comparison with mutation tolerance
function compareDNAWithMutations(dna1, dna2) {
    if (dna1.length !== dna2.length) return false;
    
    let differences = 0;
    const maxAllowedDifferences = Math.floor(dna1.length * 0.001); // 0.1% tolerance
    
    for (let i = 0; i < dna1.length; i++) {
        if (dna1[i] !== dna2[i]) {
            differences++;
            if (differences > maxAllowedDifferences) {
                return false;
            }
        }
    }
    
    return true;
}

// ==================== WEBSOCKET CONNECTIONS ====================

wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'SUBSCRIBE_BLOCKS':
                    ws.subscribeToBlocks = true;
                    break;
                case 'DNA_VERIFICATION_REQUEST':
                    // Handle real-time DNA verification
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'CONNECTION_ESTABLISHED',
        message: 'Connected to EcoChain network',
        blockchainLength: ecoChain.chain.length
    }));
});

// ==================== SERVER STARTUP ====================

server.listen(PORT, () => {
    console.log(`
🧬 EcoChain Backend Server Started
📡 Port: ${PORT}
🔗 Blockchain Length: ${ecoChain.chain.length}
🌐 WebSocket Server: Active
💾 Database: In-Memory (Development Mode)
🔐 JWT Secret: Configured
⚡ Status: Ready for DNA-based transactions
    `);
    
    // Initialize some sample data for development
    initializeSampleData();
});

// Initialize sample data
function initializeSampleData() {
    // Sample DNA sequences for testing
    const sampleDNAs = [
        'ATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGC',
        'TGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCA',
        'GCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCATGCAT'
    ];

    console.log('🧪 Sample DNA sequences loaded for testing');
    console.log('🔬 ProofOfGenetics consensus mechanism initialized');
    console.log('📊 Analytics dashboard ready');
}