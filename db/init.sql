-- ========================================================
-- Лабораторная работа: Docker Compose
-- Вариант 37: Каталог видеоигр
-- СУБД: PostgreSQL 16
-- Сущность БД: Игровая библиотека пользователя
-- ========================================================

CREATE TABLE IF NOT EXISTS user_library (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(100),
    title VARCHAR(200) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'plan_to_play',
    user_rating INT DEFAULT 8 CHECK (user_rating >= 1 AND user_rating <= 10),
    playtime_hours NUMERIC(6, 1) DEFAULT 0.0 CHECK (playtime_hours >= 0),
    platform VARCHAR(50) DEFAULT 'PC (Steam)',
    min_ram_gb INT DEFAULT 8,
    notes TEXT,
    cover_emoji VARCHAR(20) DEFAULT '🎮',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации выборок
CREATE INDEX IF NOT EXISTS idx_user_library_status ON user_library(status);
CREATE INDEX IF NOT EXISTS idx_user_library_genre ON user_library(genre);

-- Начальное наполнение библиотеки пользователя первичными данными
INSERT INTO user_library (game_id, title, genre, status, user_rating, playtime_hours, platform, min_ram_gb, notes, cover_emoji, added_at)
VALUES
    ('baldurs-gate-3', 'Baldur''s Gate 3', 'CRPG', 'playing', 10, 114.5, 'PC (Steam)', 8, 'Пройден 2-й акт на уровне сложности Тактика. Вариативность запредельная!', '🎲', NOW() - INTERVAL '15 days'),
    ('cyberpunk-2077', 'Cyberpunk 2077', 'RPG / Action', 'completed', 9, 87.0, 'PC (GOG)', 12, 'Сюжетное дополнение Phantom Liberty пройдено на лучшую концовку. Визуал космический.', '🦾', NOW() - INTERVAL '40 days'),
    ('the-witcher-3', 'The Witcher 3: Wild Hunt', 'RPG / Action', 'completed', 10, 168.0, 'PC (Steam)', 6, 'Шедевр на все времена. Blood and Wine закрыто на все 100%.', '⚔️', NOW() - INTERVAL '120 days'),
    ('hades-2', 'Hades II', 'Roguelike / Action', 'playing', 9, 38.5, 'PC (Steam)', 4, 'Шикарный геймплей за Мелиною, саундтрек Даррена Корба на репите.', '🔥', NOW() - INTERVAL '5 days'),
    ('hollow-knight', 'Hollow Knight', 'Metroidvania', 'completed', 10, 62.0, 'PC (Steam)', 4, 'Сложнейший Пантеон Халлоунеста пройден. Ждем Silksong!', '🪲', NOW() - INTERVAL '90 days'),
    ('elden-ring', 'Elden Ring', 'Action RPG / Souls-like', 'plan_to_play', 8, 12.0, 'PC (Steam)', 12, 'Победил Маргита и Годрика. Отложил до прохождения нового DLC.', '💍', NOW() - INTERVAL '2 days');
