create database if not exists kiripedia default charset utf8 collate utf8_general_ci;

use kiripedia;

create table if not exists `user`(
    `userid` INT UNSIGNED AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(200) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `avatar` VARCHAR(100),
    `register_date` DATE,
    `user_belong_groups` INT UNSIGNED,
    `user_status` TINYINT,
    PRIMARY KEY ( userid )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `encyclopedia` (
    `eid` INT UNSIGNED AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `create_date` DATE,
    `createrid` INT UNSIGNED,
    `lasteditorid` INT UNSIGNED,
    `category` INT UNSIGNED,
    `content` LONGTEXT,
    PRIMARY KEY ( eid )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `encyclopedia_contribution` (
    `contru_id` INT UNSIGNED AUTO_INCREMENT,
    `eid` INT UNSIGNED,
    `userid` INT UNSIGNED
)