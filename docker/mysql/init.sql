-- 创建用户表
CREATE TABLE IF NOT EXISTS `users` (
  `_id` varchar(32) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `dormitory` varchar(20) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `contact` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `salt` varchar(50) NOT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `idx_student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建图书表
CREATE TABLE IF NOT EXISTS `books` (
  `_id` varchar(32) NOT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `author` varchar(50) DEFAULT NULL,
  `publisher` varchar(50) DEFAULT NULL,
  `cover` varchar(255) DEFAULT NULL,
  `main_category` varchar(20) NOT NULL,
  `sub_category` varchar(20) DEFAULT NULL,
  `special_zone` varchar(20) DEFAULT NULL,
  `dormitory` varchar(20) NOT NULL,
  `owner_id` varchar(32) NOT NULL,
  `status` enum('available','borrowed') NOT NULL DEFAULT 'available',
  `current_borrower` varchar(32) DEFAULT NULL,
  `borrow_count` int NOT NULL DEFAULT '0',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`_id`),
  KEY `idx_owner` (`owner_id`),
  KEY `idx_dormitory` (`dormitory`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建借阅记录表
CREATE TABLE IF NOT EXISTS `borrow_records` (
  `_id` varchar(32) NOT NULL,
  `book_id` varchar(32) NOT NULL,
  `book_title` varchar(100) NOT NULL,
  `borrower_id` varchar(32) NOT NULL,
  `borrower_name` varchar(50) NOT NULL,
  `dormitory` varchar(20) NOT NULL,
  `borrow_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `due_time` datetime NOT NULL,
  `return_time` datetime DEFAULT NULL,
  `status` enum('borrowed','returned') NOT NULL DEFAULT 'borrowed',
  PRIMARY KEY (`_id`),
  KEY `idx_book` (`book_id`),
  KEY `idx_borrower` (`borrower_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建分类表
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('main','sub','zone') NOT NULL COMMENT '分类类型',
  `name` varchar(20) NOT NULL COMMENT '分类名称',
  `parent_id` int DEFAULT NULL COMMENT '父分类ID',
  `description` varchar(255) DEFAULT NULL COMMENT '分类描述',
  `icon` varchar(255) DEFAULT NULL COMMENT '分类图标',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_name_type` (`name`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图书分类表';

-- 初始化分类数据
INSERT INTO `categories` (`type`, `name`, `parent_id`, `description`) VALUES
('main', '文学类', NULL, '包括小说、散文、诗歌等文学作品'),
('main', '科普类', NULL, '科学普及和专业知识类书籍'),
('main', '历史类', NULL, '历史研究和传记类书籍'),
('main', '生活类', NULL, '生活实用技能和休闲类书籍'),
('main', '青年读物', NULL, '面向青年读者的书籍'),
('sub', '经典文学', 1, '国内外经典文学作品'),
('sub', '当代小说', 1, '现当代小说作品'),
('sub', '诗歌散文', 1, '诗歌和散文集'),
('sub', '戏剧剧本', 1, '戏剧剧本和影视文学'),
('sub', '天文地理', 2, '天文学和地理学相关'),
('sub', '生物医学', 2, '生物学和医学健康'),
('sub', '人工智能', 2, '计算机和AI技术'),
('sub', '社会科学', 2, '社会学和心理学'),
('sub', '中国通史', 3, '中国历史通史类'),
('sub', '世界文明史', 3, '世界各文明历史'),
('sub', '人物传记', 3, '历史人物传记'),
('sub', '考古发现', 3, '考古学和文物研究'),
('zone', '中南专区', NULL, '中南大学校友作品专区'),
('zone', '诺贝尔奖著作', NULL, '诺贝尔奖获得者作品按领域划分'),
('zone', '湖湘文化特藏', NULL, '湖南地方文化特色藏书'),
('zone', '校园推荐', NULL, '校园师生推荐图书');
