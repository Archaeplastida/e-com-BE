\c ecom_db;

DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Cart;
DROP TABLE IF EXISTS Tag;
DROP TABLE IF EXISTS Product_tag_map;
DROP TABLE IF EXISTS Product_image;
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS Sessions;

CREATE TABLE Users (
    id INTEGER NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Products (
    id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    product_name VARCHAR(250) NOT NULL,
    product_description TEXT,
    price FLOAT NOT NULL,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (seller_id) REFERENCES Users(id)
);

CREATE TABLE Cart (
    id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

CREATE TABLE Tag (
    id INTEGER NOT NULL,
    tag_name VARCHAR(50),
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE Product_tag_map (
    id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (product_id) REFERENCES Products(id),
    FOREIGN KEY (tag_id) REFERENCES Tag(id)
);

CREATE TABLE Product_image (
    id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    image_url TEXT,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

CREATE TABLE Review (
    id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    review_text TEXT,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

CREATE TABLE Sessions (
    id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);