const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://web-service:5001';

app.use(cors());
app.use(express.json());

// Пул подключений к PostgreSQL с повторными попытками
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/gamedb',
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[Database Pool Error]:', err.message);
});

// Проверка здоровья всех подсистем (Backend, Database, Web-Service)
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbLatencyMs = null;
  let webServiceStatus = 'disconnected';
  let webServiceData = null;

  // 1. Проверка PostgreSQL
  const dbStart = Date.now();
  try {
    const dbRes = await pool.query('SELECT NOW() as db_time, count(*) as count FROM user_library');
    dbStatus = 'healthy';
    dbLatencyMs = Date.now() - dbStart;
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  // 2. Проверка Web-Service (Каталог видеоигр)
  try {
    const wsRes = await fetch(`${CATALOG_SERVICE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (wsRes.ok) {
      webServiceData = await wsRes.json();
      webServiceStatus = 'healthy';
    } else {
      webServiceStatus = `http_error: ${wsRes.status}`;
    }
  } catch (err) {
    webServiceStatus = `unavailable: ${err.message}`;
  }

  const isAllOk = dbStatus === 'healthy' && webServiceStatus === 'healthy';

  res.status(isAllOk ? 200 : 503).json({
    status: isAllOk ? 'ok' : 'degraded',
    service: 'game-backend-api',
    variant: 37,
    timestamp: new Date().toISOString(),
    components: {
      database: {
        type: 'PostgreSQL 16',
        status: dbStatus,
        latency_ms: dbLatencyMs
      },
      web_service: {
        url: CATALOG_SERVICE_URL,
        status: webServiceStatus,
        details: webServiceData
      }
    }
  });
});

// ==========================================================
// КНОПКА 1: Работа с внутренней базой данных (Игровая библиотека)
// ==========================================================

// GET /api/library - Получение всех игр из пользовательской библиотеки (БД)
app.get('/api/library', async (req, res) => {
  try {
    const { status, sort_by = 'added_at', order = 'DESC' } = req.query;

    const allowedSortFields = ['added_at', 'title', 'playtime_hours', 'user_rating'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'added_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let queryText = 'SELECT * FROM user_library';
    const queryParams = [];

    if (status && status !== 'all') {
      queryText += ' WHERE status = $1';
      queryParams.push(status);
    }

    queryText += ` ORDER BY ${sortField} ${sortOrder}`;

    const { rows } = await pool.query(queryText, queryParams);

    res.json({
      success: true,
      source: 'PostgreSQL Database (Таблица user_library)',
      total: rows.length,
      library: rows
    });
  } catch (err) {
    console.error('Ошибка при запросе к БД:', err);
    res.status(500).json({ success: false, error: 'Ошибка базы данных при чтении библиотеки', details: err.message });
  }
});

// POST /api/library - Добавление новой игры в библиотеку пользователя (БД)
app.post('/api/library', async (req, res) => {
  try {
    const {
      game_id = null,
      title,
      genre,
      status = 'plan_to_play',
      user_rating = 8,
      playtime_hours = 0,
      platform = 'PC (Steam)',
      min_ram_gb = 8,
      notes = '',
      cover_emoji = '🎮'
    } = req.body;

    if (!title || !genre) {
      return res.status(400).json({ success: false, error: 'Поля "title" и "genre" обязательны для заполнения' });
    }

    const insertQuery = `
      INSERT INTO user_library (game_id, title, genre, status, user_rating, playtime_hours, platform, min_ram_gb, notes, cover_emoji)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const { rows } = await pool.query(insertQuery, [
      game_id,
      title.trim(),
      genre.trim(),
      status,
      Number(user_rating) || 8,
      Number(playtime_hours) || 0,
      platform,
      Number(min_ram_gb) || 8,
      notes,
      cover_emoji
    ]);

    res.status(201).json({
      success: true,
      source: 'PostgreSQL Database',
      message: `Игра "${rows[0].title}" успешно добавлена в вашу библиотеку!`,
      item: rows[0]
    });
  } catch (err) {
    console.error('Ошибка при добавлении в БД:', err);
    res.status(500).json({ success: false, error: 'Не удалось сохранить игру в базу данных', details: err.message });
  }
});

// PATCH /api/library/:id - Обновление прогресса, рейтинга, времени или статуса
app.patch('/api/library/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, user_rating, playtime_hours, notes } = req.body;

    const updateQuery = `
      UPDATE user_library
      SET
        status = COALESCE($1, status),
        user_rating = COALESCE($2, user_rating),
        playtime_hours = COALESCE($3, playtime_hours),
        notes = COALESCE($4, notes)
      WHERE id = $5
      RETURNING *;
    `;

    const { rows } = await pool.query(updateQuery, [
      status,
      user_rating !== undefined ? Number(user_rating) : null,
      playtime_hours !== undefined ? Number(playtime_hours) : null,
      notes,
      id
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Запись с данным ID не найдена' });
    }

    res.json({
      success: true,
      message: 'Запись в библиотеке обновлена',
      item: rows[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Ошибка обновления записи', details: err.message });
  }
});

// DELETE /api/library/:id - Удаление игры из библиотеки
app.delete('/api/library/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM user_library WHERE id = $1', [id]);

    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Запись не найдена' });
    }

    res.json({
      success: true,
      message: `Игра #${id} успешно удалена из библиотеки`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Ошибка удаления записи', details: err.message });
  }
});

// GET /api/stats - Агрегированная статистика игровой библиотеки из БД
app.get('/api/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT
        COUNT(*) AS total_games,
        COALESCE(SUM(playtime_hours), 0) AS total_playtime,
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_games,
        COUNT(*) FILTER (WHERE status = 'playing') AS playing_games,
        COUNT(*) FILTER (WHERE status = 'plan_to_play') AS backlog_games,
        COALESCE(ROUND(AVG(user_rating), 1), 0) AS avg_rating
      FROM user_library;
    `;
    const { rows } = await pool.query(statsQuery);
    res.json({ success: true, stats: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Не удалось получить статистику' });
  }
});

// ==========================================================
// КНОПКА 2: Взаимодействие со специализированным Web-сервисом (Каталог видеоигр)
// ==========================================================

// GET /api/catalog/search - Запрос данных каталога у микросервиса с фильтрами
app.get('/api/catalog/search', async (req, res) => {
  try {
    const { genre, max_ram_gb, q, min_rating } = req.query;
    const params = new URLSearchParams();

    if (genre) params.append('genre', genre);
    if (max_ram_gb) params.append('max_ram_gb', max_ram_gb);
    if (q) params.append('q', q);
    if (min_rating) params.append('min_rating', min_rating);

    const targetUrl = `${CATALOG_SERVICE_URL}/api/catalog?${params.toString()}`;
    const wsResponse = await fetch(targetUrl, { signal: AbortSignal.timeout(5000) });

    if (!wsResponse.ok) {
      return res.status(wsResponse.status).json({
        success: false,
        error: `Web-сервис каталога вернул статус ${wsResponse.status}`
      });
    }

    const data = await wsResponse.json();
    res.json({
      success: true,
      source: 'Внешний микросервис (web-service:5001)',
      upstream_url: targetUrl,
      ...data
    });
  } catch (err) {
    console.error('Ошибка обращения к Web-сервису каталога:', err);
    res.status(502).json({
      success: false,
      error: 'Ошибка подключения к специализированному Web-сервису каталога видеоигр',
      details: err.message
    });
  }
});

// GET /api/catalog/genres - Список жанров из Web-сервиса
app.get('/api/catalog/genres', async (req, res) => {
  try {
    const wsResponse = await fetch(`${CATALOG_SERVICE_URL}/api/genres`, { signal: AbortSignal.timeout(3000) });
    const data = await wsResponse.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ success: false, error: 'Не удалось получить жанры от Web-сервиса' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Backend-API] Сервер бэкенда запущен на порту ${PORT}`);
  console.log(`[Backend-API] Подключение к Web-сервису: ${CATALOG_SERVICE_URL}`);
});
