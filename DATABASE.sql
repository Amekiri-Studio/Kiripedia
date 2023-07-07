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
    `eid` INT UNSIGNED AUTO_INCREMENT NOT NULL,
    `category` INT UNSIGNED,
    `permission` TINYINT NOT NULL,
    PRIMARY KEY ( eid )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `encyclopedia_content` (
    `e_content_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
    `language` CHAR(50) NOT NULL,
    `eid` INT UNSIGNED NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `describe` VARCHAR(200) NOT NULL,
    `create_date` DATE NOT NULL,
    `createrid` INT UNSIGNED NOT NULL,
    `lasteditorid` INT UNSIGNED NOT NULL,
    `content` LONGTEXT,
    `permission` TINYINT NOT NULL,
    PRIMARY KEY ( e_content_id ),
    unique key (`language`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `encyclopedia_contribution` (
    `contru_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
    `eid` INT UNSIGNED NOT NULL,
    `userid` INT UNSIGNED NOT NULL,
    PRIMARY KEY ( counru_id )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `user_groups` (
    `user_group_id` INT UNSIGNED AUTO_INCREMENT,
    `user_group_name` VARCHAR(200),
    `permission` TINYINT,
    PRIMARY KEY ( user_group_id )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `category` (
    `cat_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
    `cat_name` VARCHAR(100) NOT NULL,
    `creater` INT UNSIGNED NOT NULL,
    PRIMARY KEY ( cat_id )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `comment` (
    `comm_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
    `eid` INT UNSIGNED NOT NULL,
    `uid` INT UNSIGNED NOT NULL,
    `content` LONGTEXT NOT NULL,
    PRIMARY KEY ( comm_id )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `blockip` (
    `record_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
    `record_value` VARCHAR(100) NOT NULL,
    `recore_date` DATE NOT NULL,
    PRIMARY KEY ( record_id )
)