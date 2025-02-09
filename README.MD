# Nile - E-commerce Platform

## Overview

Nile is an e-commerce platform for users to buy and sell products. Key features include user registration, product listing, category browsing, search (to be implemented), shopping cart, and product ratings.  The platform aims for a user-friendly online shopping experience.

## User Flow

*   **User Authentication:** Registration, Login (JWT), Logout.
*   **Product Management:** Create, View Details, Update (owner only), Delete (owner only).
*   **Shopping Cart:** Add to, View, Remove from cart.
*   **Product Discovery:** Browse by Tags or Search.
*   **Product Reviews:** Rate products (one review per user per product).

## Features

*   User Registration & JWT Authentication
*   Product Listing & Management (CRUD for product owners)
*   Browse Products by Tags (Categories)
*   Shopping Cart Functionality
*   Product Reviews and Ratings
*   Tag-Based Product Categorization
*   CORS Enabled Backend
*   JSON Request Body Parsing
*   Input Validation (JSON Schema)

## Backend API Endpoints


| Method | Endpoint         | Description                       | Authentication | Request Body Schema |
| :----- | :--------------- | :-------------------------------- | :--------------- | :------------------ |
| POST   | `/auth/login`     | Log in, get JWT token             | Public           | `loginSchema`       |
| POST   | `/auth/register`  | Register new user                 | Public           | `registerSchema`    |
| GET    | `/auth/logout`    | Log out current user              | JWT Required     | None                |
| GET    | `/auth/verify`    | Verify JWT token validity         | JWT Required     | None                |
| GET    | `/users/me`       | Get logged-in user details        | JWT Required     | None                |
| GET    | `/users/cart`     | Get logged-in user's cart         | JWT Required     | None                |
| POST   | `/users/cart`     | Add product to cart               | JWT Required     | `cartItemSchema`    |
| DELETE | `/users/cart`     | Remove product from cart          | JWT Required     | `cartItemSchema`    |
| POST   | `/products/create`| Create new product listing        | JWT Required     | `createProductSchema`|
| GET    | `/products`       | Get all products                  | JWT Required*    | None                |
| GET    | `/products/:product_id`| Get specific product details    | JWT Required*    | None                |
| PATCH  | `/products/:product_id`| Update product (owner only)     | JWT Required     | `updateProductSchema`|
| DELETE | `/products/:product_id`| Delete product (owner only)     | JWT Required     | None                |
| GET    | `/products/tag/:tag_id`| Get products by tag             | JWT Required     | None                |
| GET    | `/products/tags/all`| Get all tags                    | JWT Required     | None                |
| POST   | `/products/:product_id/rate`| Rate a product            | JWT Required     | `rateProductSchema`|


## Database Schema

**Tables:**

*   **Users:**
    *   `id` SERIAL PRIMARY KEY
    *   `user_name` VARCHAR(50) NOT NULL UNIQUE
    *   `first_name` VARCHAR(50) NOT NULL
    *   `last_name` VARCHAR(50) NOT NULL
    *   `email` VARCHAR(50) NOT NULL
    *   `password` VARCHAR(100) NOT NULL
    *   `is_active` BOOLEAN NOT NULL
    *   `created_at` TIMESTAMP NOT NULL DEFAULT NOW()

*   **Products:**
    *   `id` SERIAL PRIMARY KEY
    *   `seller_id` INTEGER NOT NULL (FOREIGN KEY references Users.id)
    *   `product_name` VARCHAR(250) NOT NULL
    *   `product_description` TEXT
    *   `price` FLOAT NOT NULL
    *   `is_active` BOOLEAN NOT NULL
    *   `created_at` TIMESTAMP NOT NULL DEFAULT NOW()

*   **Cart:**
    *   `id` SERIAL PRIMARY KEY
    *   `user_id` INTEGER NOT NULL (FOREIGN KEY references Users.id)
    *   `product_id` INTEGER NOT NULL (FOREIGN KEY references Products.id)
    *   `is_active` BOOLEAN NOT NULL
    *   `created_at` TIMESTAMP NOT NULL DEFAULT NOW()

*   **Tag:**
    *   `id` SERIAL PRIMARY KEY
    *   `tag_name` VARCHAR(50)
    *   `is_active` BOOLEAN NOT NULL
    *   `created_at` TIMESTAMP NOT NULL DEFAULT NOW()

*   **Product\_tag\_map:** (Many-to-Many relationship between Products and Tags)
    *   `id` SERIAL PRIMARY KEY
    *   `product_id` INTEGER NOT NULL (FOREIGN KEY references Products.id)
    *   `tag_id` INTEGER NOT NULL (FOREIGN KEY references Tag.id)

*   **Product\_image:**
    *   `id` SERIAL PRIMARY KEY
    *   `product_id` INTEGER NOT NULL (FOREIGN KEY references Products.id)
    *   `image_url` TEXT
    *   `is_active` BOOLEAN NOT NULL
    *   `created_at` TIMESTAMP NOT NULL DEFAULT NOW()

*   **Review:**
    *   `id` SERIAL PRIMARY KEY
    *   `user_id` INTEGER NOT NULL (FOREIGN KEY references Users.id)
    *   `product_id` INTEGER NOT NULL (FOREIGN KEY references Products.id)
    *   `rating` INTEGER NOT NULL
    *   `review_text` TEXT
    *   `is_active` BOOLEAN NOT NULL
    *   `created_at` TIMESTAMP NOT NULL DEFAULT NOW()

*   **Sessions:**
    *   `id` SERIAL PRIMARY KEY
    *   `user_id` INTEGER NOT NULL (FOREIGN KEY references Users.id)
    *   `token` TEXT NOT NULL
    *   `is_active` BOOLEAN NOT NULL
    *   `created_at` TIMESTAMP NOT NULL DEFAULT NOW()

**Relationships:**

*   **One-to-Many:** Users to Products (one seller can have many products), Users to Cart (one user can have one cart - implicitly, though cart items are separate), Users to Reviews, Users to Sessions, Products to Cart, Products to Product\_image, Products to Reviews, Products to Product\_tag\_map, Tags to Product\_tag\_map.
*   **Many-to-Many:** Products to Tags (through Product\_tag\_map).