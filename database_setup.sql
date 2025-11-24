-- Riri Order Tracker Database Setup (Updated for Multiple Orders)
-- MySQL Database Schema and Sample Data

-- Create the orders table (supports multiple orders per email)
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
);

-- Insert sample data with multiple orders per email
INSERT INTO orders (email, tracking_url, order_number, order_date) VALUES
-- Multiple orders for test@example.com (most recent will be returned)
('test@example.com', 'https://www.fedex.com/fedextrack/?tracknum=OLD123456789', 'ORD-001', '2024-11-20 10:00:00'),
('test@example.com', 'https://www.fedex.com/fedextrack/?tracknum=NEW987654321', 'ORD-004', '2024-11-24 14:30:00'),

-- Single order for user@demo.com
('user@demo.com', 'https://tools.usps.com/go/TrackConfirmAction?tLabels=9400108205496461555616', 'ORD-002', '2024-11-22 09:15:00'),

-- Multiple orders for customer@test.com (most recent will be returned)
('customer@test.com', 'https://www.ups.com/track?tracknum=1Z999AA1234567890', 'ORD-003', '2024-11-21 16:45:00'),
('customer@test.com', 'https://www.dhl.com/en/express/tracking.html?AWB=1122334455', 'ORD-005', '2024-11-23 11:20:00');

-- Example queries:

-- Get most recent order for an email
-- SELECT * FROM orders WHERE LOWER(email) = LOWER('test@example.com') ORDER BY order_date DESC, created_at DESC LIMIT 1;

-- Get all orders for an email (ordered by most recent first)
-- SELECT * FROM orders WHERE LOWER(email) = LOWER('test@example.com') ORDER BY order_date DESC, created_at DESC;

-- Add a new order (allows multiple per email)
-- INSERT INTO orders (email, tracking_url, order_number, order_date) 
-- VALUES ('newemail@example.com', 'https://tracking-url-here.com', 'ORD-006', NOW());

-- Get access statistics
-- SELECT email, order_number, access_count, last_accessed, order_date 
-- FROM orders 
-- ORDER BY access_count DESC;

-- Clean up old orders (older than 90 days with no recent access)
-- DELETE FROM orders 
-- WHERE order_date < DATE_SUB(NOW(), INTERVAL 90 DAY) 
-- AND (last_accessed IS NULL OR last_accessed < DATE_SUB(NOW(), INTERVAL 30 DAY));