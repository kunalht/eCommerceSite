CREATE TABLE user(id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, 
email VARCHAR(256),
password VARCHAR(256),
fullname VARCHAR(256),
nickname varchar(50))ENGINE=InnoDB;


CREATE TABLE categories(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(256),
    slug VARCHAR(256),
    parent_id INT,
    foreign KEY (parent_id) references categories(id)
)ENGINE=InnoDB;

Create table products(id INT AUTO_INCREMENT PRIMARY KEY,
 name varchar(100),
image varchar(150),
price double(10,2),
description varchar(200),
longDesc varchar(600),
category_id int,
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
isDeleted boolean DEFAULT FALSE,
foreign key (category_id) references categories(id)
 )ENGINE=InnoDB;

 create table user_addr(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    fname varchar(30),
    lname varchar(30),
    address varchar(255),
    city varchar(40),
    state varchar(40),
    zip varchar(40),
    country varchar(40),
    phone varchar(20),
    user_id INT NOT NULL,
foreign key (user_id) references user(id)
ON DELETE CASCADE
)ENGINE = InnoDB;



create table cart( id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
user_id INT NOT NULL,
item_id INT NOT NULL,
quantity INT DEFAULT 1,
foreign key (user_id) references user(id),
foreign key (item_id) references products(id)
)ENGINE = InnoDB;


create table orders(id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
addr_id INT NOT NULL,
user_id INT NOT NULL,
createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
status ENUM('ordered','shipped','delivered','cancelled'),
amount double,
foreign key (addr_id) references user_addr(id),
foreign key (user_id) references user(id)
)ENGINE=InnoDB;


create table order_items(id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
order_id INT NOT NULL,
item_id INT NOT NULL,
quantity INT,
itemPrice double(10,2),
foreign key (order_id) references orders(id),
foreign key (item_id) references products(id)
)ENGINE=InnoDB;

CREATE TABLE paypalOrder(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    paymentId VARCHAR(256),
    description VARCHAR(256),
    payerId VARCHAR(256),
    token VARCHAR(256),
    cart VARCHAR(256),
    paymentMethod VARCHAR(256),
    payerEmail VARCHAR(256),
    payerFirstName VARCHAR(256),
    payerLastName VARCHAR(256),
    payerShippingName VARCHAR(256),
    payerAddress VARCHAR(256),
    payerCity VARCHAR(256),
    payerPostalCode VARCHAR(256),
    transactionAmount VARCHAR(256),
    transactionCurrency VARCHAR(256),
    merchentId VARCHAR(256),
    payeeEmail VARCHAR(256),
    productName VARCHAR(256),
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount double(10,2),
    productId INT,
    response TEXT(65530)
)ENGINE=InnoDB;


CREATE TABLE paypalAmount(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    paypalId VARCHAR(256),
    amount VARCHAR(256)
)ENGINE=InnoDB;
