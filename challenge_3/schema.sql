DROP DATABASE IF EXISTS checkout;
CREATE DATABASE checkout;

USE checkout;

CREATE TABLE customers (
  id int(3) AUTO_INCREMENT,
  name VARCHAR(40) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(40) NOT NULL,
  PRIMARY KEY(id)
);

