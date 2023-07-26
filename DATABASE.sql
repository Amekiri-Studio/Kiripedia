create database if not exists kiripedia default charset utf8 collate utf8_general_ci;

use kiripedia;

create table if not exists `user`(
    `userid` INT UNSIGNED AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `nickname` VARCHAR(200) NOT NULL,
    `password` VARCHAR(200) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `avatar` VARCHAR(100),
    `register_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `user_belong_groups` INT UNSIGNED,
    `user_status` TINYINT,
    PRIMARY KEY ( userid )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `encyclopedia` (
    `eid` INT UNSIGNED AUTO_INCREMENT NOT NULL,
    `category` INT UNSIGNED,
    `permission` TINYINT NOT NULL,
    `redirect_link` VARCHAR(100),
    PRIMARY KEY ( eid )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `encyclopedia_content` (
    `e_content_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
    `language` INT UNSIGNED NOT NULL,
    `eid` INT UNSIGNED NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `describe` VARCHAR(200) NOT NULL,
    `create_date` DATETIME NOT NULL,
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
    `language` INT UNSIGNED,
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
    `recore_date` DATETIME NOT NULL,
    PRIMARY KEY ( record_id )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `change_logs` (
    `log_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
    `log_type` TINYINT NOT NULL,
    `old` LONGTEXT,
    `new` LONGTEXT,
    PRIMARY KEY ( log_id )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `user_login_record`(
    `log_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
    `userid` INT UNSIGNED NOT NULL,
    `loginip` VARCHAR(100) NOT NULL,
    `logindate` DATETIME,
    PRIMARY KEY ( log_id )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `language`(
    `language_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
    `language_name` VARCHAR(100),
    PRIMARY KEY ( language_id )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into language (language_name)
    values ('简体中文'),('繁體中文'),('English'),('日本語'),('한국어'),('Русский');

insert into user_groups (user_group_name,permission)
    values ('root',31);