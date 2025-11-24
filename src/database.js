const mysql = require('mysql2/promise');

class DatabaseManager {
    constructor() {
        // Use the correct MySQL server details from hosting panel
        this.connectionConfigs = [
            {
                name: 'Hostinger MySQL hostname',
                config: {
                    host: 'srv1710.hstgr.io',
                    port: 3306,
                    user: 'u779702962_nvvsklr',
                    password: 'vEb*6m|G',
                    database: 'u779702962_trackinginfo',
                    ssl: false,
                    connectTimeout: 10000
                }
            },
            {
                name: 'Hostinger MySQL IP',
                config: {
                    host: '82.197.82.93',
                    port: 3306,
                    user: 'u779702962_nvvsklr',
                    password: 'vEb*6m|G',
                    database: 'u779702962_trackinginfo',
                    ssl: false,
                    connectTimeout: 10000
                }
            }
        ];
        this.pool = null;
        this.initDatabase();
    }

    async initDatabase() {
        // Try different connection configurations
        for (const {name, config} of this.connectionConfigs) {
            try {
                console.log(`🔄 Trying ${name}...`);
                this.pool = mysql.createPool({
                    ...config,
                    waitForConnections: true,
                    connectionLimit: 10,
                    queueLimit: 0
                });
                
                // Test the connection
                const connection = await this.pool.getConnection();
                console.log(`✅ Connected to MySQL database using ${name}`);
                connection.release();
                
                await this.createTables();
                await this.insertSampleData();
                return; // Success! Exit the loop
                
            } catch (err) {
                console.log(`❌ ${name} failed:`, err.code);
                if (this.pool) {
                    await this.pool.end();
                    this.pool = null;
                }
            }
        }
        
        console.error('💥 All database connection attempts failed');
        console.error('The system will continue with local fallback data');
    }

    async createTables() {
        try {
            const createOrdersTable = `
                CREATE TABLE IF NOT EXISTS orders (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    email VARCHAR(255) NOT NULL,
                    tracking_url TEXT NOT NULL,
                    order_number VARCHAR(100),
                    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_accessed TIMESTAMP NULL,
                    access_count INT DEFAULT 0,
                    INDEX idx_email_date (email, order_date),
                    INDEX idx_email (email),
                    INDEX idx_order_date (order_date)
                )
            `;

            await this.pool.execute(createOrdersTable);
            
            // Check if order_date column exists, if not add it
            try {
                await this.pool.execute(`
                    ALTER TABLE orders 
                    ADD COLUMN order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER order_number
                `);
                console.log('Added order_date column to existing table');
            } catch (err) {
                // Column might already exist, that's fine
                if (!err.message.includes('Duplicate column')) {
                    console.log('order_date column already exists or other error:', err.message);
                }
            }
            
            // Remove the UNIQUE constraint on email if it exists
            try {
                await this.pool.execute(`
                    ALTER TABLE orders DROP INDEX email
                `);
                console.log('Removed UNIQUE constraint on email column');
            } catch (err) {
                // Index might not exist, that's fine
                console.log('Email index removal result:', err.message);
            }
            
            console.log('Orders table created/verified');
        } catch (error) {
            console.error('Error creating orders table:', error);
            throw error;
        }
    }

    async insertSampleData() {
        const sampleOrders = [
            // Multiple orders for test@example.com
            {
                email: 'test@example.com',
                tracking_url: 'https://www.fedex.com/fedextrack/?tracknum=OLD123456789',
                order_number: 'ORD-001',
                order_date: new Date('2024-11-20') // Older order
            },
            {
                email: 'test@example.com',
                tracking_url: 'https://www.fedex.com/fedextrack/?tracknum=NEW987654321',
                order_number: 'ORD-004',
                order_date: new Date('2024-11-24') // Most recent order
            },
            // Single order for user@demo.com
            {
                email: 'user@demo.com',
                tracking_url: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=987654321',
                order_number: 'ORD-002',
                order_date: new Date('2024-11-22')
            },
            // Multiple orders for customer@test.com
            {
                email: 'customer@test.com',
                tracking_url: 'https://www.ups.com/track?tracknum=1Z999AA1234567890',
                order_number: 'ORD-003',
                order_date: new Date('2024-11-21') // Older order
            },
            {
                email: 'customer@test.com',
                tracking_url: 'https://www.dhl.com/en/express/tracking.html?AWB=1122334455',
                order_number: 'ORD-005',
                order_date: new Date('2024-11-23') // Most recent order
            }
        ];

        for (const order of sampleOrders) {
            try {
                await this.insertOrder(
                    order.email, 
                    order.tracking_url, 
                    order.order_number,
                    order.order_date
                );
            } catch (err) {
                console.error('Error inserting sample order:', err);
            }
        }
    }

    async insertOrder(email, trackingUrl, orderNumber = null, orderDate = null) {
        if (!this.pool) {
            console.warn('Database not connected, skipping insert');
            return null;
        }
        
        try {
            const sql = `
                INSERT INTO orders (email, tracking_url, order_number, order_date)
                VALUES (?, ?, ?, ?)
            `;
            
            // Use provided orderDate or current timestamp
            const finalOrderDate = orderDate || new Date();
            
            const [result] = await this.pool.execute(sql, [
                email.toLowerCase(), 
                trackingUrl, 
                orderNumber, 
                finalOrderDate
            ]);
            console.log('Order inserted for email:', email, 'with date:', finalOrderDate);
            return result.insertId;
        } catch (error) {
            console.error('Error inserting order:', error.message);
            return null;
        }
    }

    async findOrderByEmail(email) {
        if (!this.pool) {
            console.warn('Database not connected, returning null');
            return null;
        }
        
        try {
            const sql = `
                SELECT * FROM orders 
                WHERE LOWER(email) = LOWER(?)
                ORDER BY order_date DESC, created_at DESC
                LIMIT 1
            `;
            
            const [rows] = await this.pool.execute(sql, [email]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error finding order:', error.message);
            return null;
        }
    }

    async updateAccessCount(email) {
        if (!this.pool) {
            console.warn('Database not connected, skipping update');
            return 0;
        }
        
        try {
            const sql = `
                UPDATE orders 
                SET access_count = access_count + 1, last_accessed = CURRENT_TIMESTAMP
                WHERE LOWER(email) = LOWER(?)
            `;
            
            const [result] = await this.pool.execute(sql, [email]);
            return result.affectedRows;
        } catch (error) {
            console.error('Error updating access count:', error.message);
            return 0;
        }
    }

    async getAllOrdersForEmail(email) {
        if (!this.pool) {
            console.warn('Database not connected, returning empty array');
            return [];
        }
        
        try {
            const sql = `
                SELECT * FROM orders 
                WHERE LOWER(email) = LOWER(?)
                ORDER BY order_date DESC, created_at DESC
            `;
            
            const [rows] = await this.pool.execute(sql, [email]);
            return rows;
        } catch (error) {
            console.error('Error getting all orders for email:', error.message);
            return [];
        }
    }

    async getAllOrders() {
        try {
            const sql = `
                SELECT * FROM orders 
                ORDER BY created_at DESC
            `;
            
            const [rows] = await this.pool.execute(sql);
            return rows;
        } catch (error) {
            console.error('Error getting all orders:', error);
            throw error;
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('Database connection pool closed');
        }
    }
}

module.exports = DatabaseManager;