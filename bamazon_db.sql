ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';

DROP DATABASE IF EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
	item_id int not null unique,
    CONSTRAINT item_id check (item_id >= 1010),
    book_name varchar(255) not null,
    department_name varchar(255) not null,
    price_USD decimal(18, 2) ,
    stock_quantity int not null,
    CONSTRAINT stock_quantity check (stock_quantity >= 0)
);

USE bamazon_db;

CREATE TABLE cart (
	item_id int not null unique,
    CONSTRAINT item_id check (item_id >= 1010),
	book_name varchar(255) not null,
    department_name varchar(255) not null,
    price_USD decimal(18, 2),
    quantity int,
    CONSTRAINT quantity check (quantity > 0)
);
    
SELECT * FROM products;
TRUNCATE TABLE products;
-- DROP TABLE products;

SELECT * FROM cart;
TRUNCATE TABLE cart;
-- DROP TABLE cart;

-- Coding & Developing
INSERT INTO products (item_id, book_name, department_name, price_USD, stock_quantity) VALUES (1010, "Speaking: HTML/CSS", "Coding & Developing", 29.99, 30);
INSERT INTO products (item_id, book_name, department_name, price_USD, stock_quantity) VALUES (1011, "Speaking: JavaScript", "Coding & Developing", 39.99, 20);
INSERT INTO products (item_id, book_name, department_name, price_USD, stock_quantity) VALUES (1012, "Speaking: SQL", "Coding & Developing", 39.99, 20);

-- Behind the Wheel
INSERT INTO products (item_id, book_name, department_name, price_USD, stock_quantity) VALUES (2021, "How To: Use Turn Signals", "Behind the Wheel", 9.99, 100);
INSERT INTO products (item_id, book_name, department_name, price_USD, stock_quantity) VALUES (2022, "How To: Read Traffic Signs", "Behind the Wheel", 9.99, 100);
INSERT INTO products (item_id, book_name, department_name, price_USD, stock_quantity) VALUES (2023, "How To: Drive In The Rain", "Behind the Wheel", 9.99, 100);
INSERT INTO products (item_id, book_name, department_name, price_USD, stock_quantity) VALUES (2024, "How To: Cut People Off", "Behind the Wheel", 9.99, 100);
INSERT INTO products (item_id, book_name, department_name, price_USD, stock_quantity) VALUES (2025, "How To: Not Drive Like An A**hole", "Behind the Wheel", 9.99, 100);

-- Change My Mind
INSERT INTO products (item_id, book_name, department_name, price_USD, stock_quantity) VALUES (3032, "Pop-Tarts Are Ravioli", "Change My Mind", 19.99, 50);
INSERT INTO products (item_id, book_name, department_name, price_USD, stock_quantity) VALUES (3033, "Male Privilege Is a Myth", "Change My Mind", 19.99, 50);
INSERT INTO products (item_id, book_name, department_name, price_USD, stock_quantity) VALUES (3034, "Pineapples Belong On Pizza", "Change My Mind", 19.99, 50);
INSERT INTO products (item_id, book_name, department_name, price_USD, stock_quantity) VALUES (3035, "Going To Church Doesn't Make You A Good Person", "Change My Mind", 19.99, 50);

-- RESET TO DEFAULT VALUES
UPDATE products SET stock_quantity = 30 WHERE item_id = 1010;
UPDATE products SET stock_quantity = 20 WHERE item_id = 1011;
UPDATE products SET stock_quantity = 20 WHERE item_id = 1012;

UPDATE products SET stock_quantity = 100 WHERE item_id = 2021;
UPDATE products SET stock_quantity = 100 WHERE item_id = 2022;
UPDATE products SET stock_quantity = 100 WHERE item_id = 2023;
UPDATE products SET stock_quantity = 100 WHERE item_id = 2024;
UPDATE products SET stock_quantity = 100 WHERE item_id = 2025;

UPDATE products SET stock_quantity = 50 WHERE item_id = 3032;
UPDATE products SET stock_quantity = 50 WHERE item_id = 3033;
UPDATE products SET stock_quantity = 50 WHERE item_id = 3034;
UPDATE products SET stock_quantity = 50 WHERE item_id = 3035;

