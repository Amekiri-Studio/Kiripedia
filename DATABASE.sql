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
    `create_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `createrid` INT UNSIGNED NOT NULL,
    `lasteditorid` INT UNSIGNED NOT NULL,
    `content` LONGTEXT,
    `permission` TINYINT NOT NULL,
    PRIMARY KEY ( e_content_id ),
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `encyclopedia_contribution` (
    `contru_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
    `eid` INT UNSIGNED NOT NULL,
    `ecid` INT UNSIGNED NOT NULL,
    `userid` INT UNSIGNED NOT NULL,
    `language` INT UNSIGNED,
    PRIMARY KEY ( contru_id )
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

create table if not exists `user_login_record`(
    `log_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
    `userid` INT UNSIGNED NOT NULL,
    `loginip` VARCHAR(100) NOT NULL,
    `logindate` DATETIME,
    PRIMARY KEY ( log_id )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table if not exists `language`(
    `language_id` INT UNSIGNED AUTO_INCREMENT NOT NULL,
    `language_abbr` CHAR(50),
    `language_name` VARCHAR(100),
    PRIMARY KEY ( language_id )
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

insert into language (language_name, language_abbr)
    values ('简体中文', 'zh-cn'),('繁體中文', 'zh-tw'),('English', 'en-us'),('日本語', 'ja-jp'),('한국어', 'ko-kr'),('Русский', 'ru-ru');

insert into user_groups (user_group_name,permission)
    values ('root',31);

insert into user_groups (user_group_name,permission)
    values ('admin',15);

insert into user_groups (user_group_name,permission)
    values ('user',1);

CREATE TABLE if not exists user_email_backup (
    backup_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    userid INT UNSIGNED NOT NULL,
    email VARCHAR(255),
    backup_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE if not exists encyclopedia_backup (
    backup_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    eid INT UNSIGNED NOT NULL,
    ecid INT UNSIGNED NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `describe` VARCHAR(200) NOT NULL,
    `lasteditorid` INT UNSIGNED NOT NULL,
    `content` LONGTEXT,
    backup_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE if not exists contribution_backup (
    backup_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    eid INT UNSIGNED NOT NULL,
    ecid INT UNSIGNED NOT NULL,
    userid INT UNSIGNED NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TRIGGER backup_users_email BEFORE UPDATE ON `user`
FOR EACH ROW
BEGIN
    INSERT INTO user_email_backup (userid,email)
    VALUES (OLD.userid,OLD.email);
END;

CREATE TRIGGER backup_encyclopedias BEFORE UPDATE ON `encyclopedia_content`
FOR EACH ROW
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE var_userid INT UNSIGNED;
    DECLARE cur CURSOR FOR SELECT userid FROM encyclopedia_contribution WHERE eid = OLD.eid AND ecid = OLD.e_content_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
    INSERT INTO encyclopedia_backup(eid,ecid,title,`describe`,lasteditorid,`content`) 
        VALUES(OLD.eid,OLD.e_content_id,OLD.title,OLD.describe,OLD.lasteditorid,OLD.content);

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO var_userid;
        IF done THEN
            LEAVE read_loop;
        END IF;
        INSERT INTO contribution_backup(eid,ecid,userid) VALUES(OLD.eid,OLD.e_content_id,var_userid);
        
    END LOOP;

    CLOSE cur;
END;