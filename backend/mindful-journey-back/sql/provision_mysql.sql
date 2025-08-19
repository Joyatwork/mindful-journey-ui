-- Creates database and app user with privileges
-- Variables (replace if needed):
--   DB_NAME = mindful_journey
--   APP_USER = mj_user
--   APP_PASS = Mj_Pass!123

CREATE DATABASE IF NOT EXISTS mindful_journey
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'mj_user'@'localhost' IDENTIFIED BY 'Mj_Pass!123';
CREATE USER IF NOT EXISTS 'mj_user'@'127.0.0.1' IDENTIFIED BY 'Mj_Pass!123';
GRANT ALL PRIVILEGES ON mindful_journey.* TO 'mj_user'@'localhost';
GRANT ALL PRIVILEGES ON mindful_journey.* TO 'mj_user'@'127.0.0.1';
FLUSH PRIVILEGES;

-- Fallback for auth plugin issues (uncomment if needed)
-- ALTER USER 'mj_user'@'localhost'
--   IDENTIFIED WITH mysql_native_password BY 'Mj_Pass!123';
-- ALTER USER 'mj_user'@'127.0.0.1'
--   IDENTIFIED WITH mysql_native_password BY 'Mj_Pass!123';
-- FLUSH PRIVILEGES;
