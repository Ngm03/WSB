-- Database Schema for Dormitory App (MySQL Compatible)

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    telegram_id VARCHAR(255) PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    photo_url TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255), -- Links to users.telegram_id
    username TEXT,
    date VARCHAR(255),
    slot_time VARCHAR(255),
    end_time VARCHAR(255),
    comment TEXT,
    notified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Gatherings Table
CREATE TABLE IF NOT EXISTS gatherings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title TEXT,
    time VARCHAR(255),
    description TEXT,
    created_by VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table (formerly feedback)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255),
    username TEXT,
    first_name TEXT,
    photo_url TEXT,
    category VARCHAR(50),
    message TEXT,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Review Comments Table
CREATE TABLE IF NOT EXISTS review_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT,
    user_id VARCHAR(255),
    username TEXT,
    first_name TEXT,
    photo_url TEXT,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Review Likes Table
CREATE TABLE IF NOT EXISTS review_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT,
    user_id VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (review_id, user_id),
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);
