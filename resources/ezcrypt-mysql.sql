-- SQL Dump

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `ezcrypt`
--

-- --------------------------------------------------------

--
-- Table structure for table `pastes`
--

DROP TABLE IF EXISTS `pastes`;
CREATE TABLE IF NOT EXISTS `pastes` (
  `id` int(100) NOT NULL AUTO_INCREMENT,
  `password` varchar(100) DEFAULT NULL,
  `data` longblob NOT NULL,
  `syntax` varchar(64) NOT NULL DEFAULT 'text/plain',
  `crypto` varchar(20) NOT NULL DEFAULT 'CRYPTO_JS',
  `added` int(15) DEFAULT NULL,
  `ttl` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf32;
