-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 19-Jul-2026 às 02:56
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
SET FOREIGN_KEY_CHECKS = 0;

--
-- Banco de dados: `plant_monitor`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `devices`
--
CREATE DATABASE IF NOT EXISTS plant_monitor;
USE plant_monitor;

DROP TABLE IF EXISTS `devices`;
CREATE TABLE `devices` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `device_name` varchar(100) NOT NULL,
  `bluetooth_id` varchar(150) NOT NULL,
  `paired_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `humidity_history`
--

DROP TABLE IF EXISTS `humidity_history`;
CREATE TABLE `humidity_history` (
  `id` int(10) UNSIGNED NOT NULL,
  `plant_id` int(10) UNSIGNED NOT NULL,
  `humidity` tinyint(3) UNSIGNED NOT NULL,
  `reading_date` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Estrutura da tabela `plants`
--

DROP TABLE IF EXISTS `plants`;
CREATE TABLE `plants` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `device_id` int(10) UNSIGNED DEFAULT NULL,
  `type_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `humidity` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `last_watered` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Estrutura da tabela `plant_types`
--

DROP TABLE IF EXISTS `plant_types`;
CREATE TABLE `plant_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `min_humidity` tinyint(3) UNSIGNED NOT NULL DEFAULT 30,
  `max_humidity` tinyint(3) UNSIGNED NOT NULL DEFAULT 70,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Extraindo dados da tabela `plant_types`
--

INSERT INTO `plant_types` (`id`, `name`, `min_humidity`, `max_humidity`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Suculenta', 15, 35, 'Precisa de pouca água.', '2026-07-18 23:48:19', '2026-07-18 23:48:19'),
(2, 'Cacto', 10, 30, 'Requer muito pouca humidade.', '2026-07-18 23:48:19', '2026-07-18 23:48:19'),
(7, 'Orquídea', 35, 55, 'Prefere humidade moderada.', '2026-07-18 23:48:19', '2026-07-18 23:48:19'),
(10, 'Outra', 30, 70, 'Tipo genérico.', '2026-07-18 23:48:19', '2026-07-18 23:48:19'),
(11, 'Aloe Vera', 15, 35, 'Precisa de pouca água.', '2026-07-19 00:53:19', '2026-07-19 00:53:19'),
(12, 'Tomate', 50, 80, 'Planta de horta, gosta de solo húmido.', '2026-07-19 00:53:19', '2026-07-19 00:53:19'),
(13, 'Hortelã', 45, 70, 'Erva aromática, gosta de humidade regular.', '2026-07-19 00:53:19', '2026-07-19 00:53:19'),
(14, 'Manjericão', 40, 65, 'Erva aromática comum na cozinha.', '2026-07-19 00:53:19', '2026-07-19 00:53:19'),
(15, 'Roseira', 40, 65, 'Precisa de rega regular sem encharcar.', '2026-07-19 00:53:19', '2026-07-19 00:53:19');

-- --------------------------------------------------------

--
-- Estrutura da tabela `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'rafael', 'rafael', 'rafael@email.com', '$2y$10$eMsR5K5.6Y83Kd/5H8.e1e07fQWrDL7Xf6/v6Wn9b4LqDxXuUj19O', '2026-07-18 23:48:23', '2026-07-18 23:48:23'),
(2, '333', '333', '333@email.pt', '$2y$10$tkAjJRm7bH/KmLDj8kFHXO/LFOrN0PGXtdgKg40D7b9YryeNmkkZO', '2026-07-19 00:40:45', '2026-07-19 00:40:45');

-- --------------------------------------------------------

--
-- Estrutura stand-in para vista `view_plant_status`
-- (Veja abaixo para a view atual)
--
CREATE TABLE `view_plant_status` (
`id` int(10) unsigned
,`user_id` int(10) unsigned
,`name` varchar(100)
,`humidity` tinyint(3) unsigned
,`last_watered` datetime
,`created_at` timestamp
,`updated_at` timestamp
,`type` varchar(100)
,`min_humidity` tinyint(3) unsigned
,`max_humidity` tinyint(3) unsigned
,`device_name` varchar(100)
,`bluetooth_id` varchar(150)
,`plant_status` varchar(14)
);

-- --------------------------------------------------------

--
-- Estrutura da tabela `watering_logs`
--

DROP TABLE IF EXISTS `watering_logs`;
CREATE TABLE `watering_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `plant_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `amount_ml` int(10) UNSIGNED DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `watered_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para vista `view_plant_status`
--
DROP TABLE IF EXISTS `view_plant_status`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_plant_status`  AS SELECT `p`.`id` AS `id`, `p`.`user_id` AS `user_id`, `p`.`name` AS `name`, `p`.`humidity` AS `humidity`, `p`.`last_watered` AS `last_watered`, `p`.`created_at` AS `created_at`, `p`.`updated_at` AS `updated_at`, `pt`.`name` AS `type`, `pt`.`min_humidity` AS `min_humidity`, `pt`.`max_humidity` AS `max_humidity`, `d`.`device_name` AS `device_name`, `d`.`bluetooth_id` AS `bluetooth_id`, CASE WHEN `p`.`humidity` < `pt`.`min_humidity` THEN 'precisa_agua' WHEN `p`.`humidity` > `pt`.`max_humidity` THEN 'demasiada_agua' ELSE 'ideal' END AS `plant_status` FROM ((`plants` `p` left join `plant_types` `pt` on(`pt`.`id` = `p`.`type_id`)) left join `devices` `d` on(`d`.`id` = `p`.`device_id`)) ;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bluetooth_id` (`bluetooth_id`),
  ADD KEY `idx_devices_user_id` (`user_id`),
  ADD KEY `idx_devices_bluetooth_id` (`bluetooth_id`);

--
-- Índices para tabela `humidity_history`
--
ALTER TABLE `humidity_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_humidity_history_plant_id` (`plant_id`),
  ADD KEY `idx_humidity_history_reading_date` (`reading_date`);

--
-- Índices para tabela `plants`
--
ALTER TABLE `plants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_plants_device` (`device_id`),
  ADD KEY `idx_plants_user_id` (`user_id`),
  ADD KEY `idx_plants_device_id` (`device_id`),
  ADD KEY `idx_plants_type_id` (`type_id`);

--
-- Índices para tabela `plant_types`
--
ALTER TABLE `plant_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Índices para tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`);

--
-- Índices para tabela `watering_logs`
--
ALTER TABLE `watering_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_watering_plant_id` (`plant_id`),
  ADD KEY `idx_watering_user_id` (`user_id`),
  ADD KEY `idx_watering_watered_at` (`watered_at`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `devices`
--
ALTER TABLE `devices`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `humidity_history`
--
ALTER TABLE `humidity_history`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `plants`
--
ALTER TABLE `plants`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `plant_types`
--
ALTER TABLE `plant_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `watering_logs`
--
ALTER TABLE `watering_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `devices`
--
ALTER TABLE `devices`
  ADD CONSTRAINT `fk_devices_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limitadores para a tabela `humidity_history`
--
ALTER TABLE `humidity_history`
  ADD CONSTRAINT `fk_humidity_history_plant` FOREIGN KEY (`plant_id`) REFERENCES `plants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limitadores para a tabela `plants`
--
ALTER TABLE `plants`
  ADD CONSTRAINT `fk_plants_device` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_plants_type` FOREIGN KEY (`type_id`) REFERENCES `plant_types` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_plants_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limitadores para a tabela `watering_logs`
--
ALTER TABLE `watering_logs`
  ADD CONSTRAINT `fk_watering_plant` FOREIGN KEY (`plant_id`) REFERENCES `plants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_watering_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
