const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Каталог видеоигр с жанрами и минимальными системными требованиями
const gamesCatalog = [
  {
    id: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    genre: 'RPG / Action',
    year: 2020,
    rating: 8.6,
    developer: 'CD Projekt RED',
    cover_emoji: '🦾',
    description: 'Масштабная ролевая игра в открытом мире Найт-Сити с ультрасовременной графикой и трассировкой лучей.',
    tags: ['Open World', 'Cyberpunk', 'Sci-Fi', 'Story Rich'],
    min_requirements: {
      os: 'Windows 10 64-bit',
      cpu: 'Intel Core i7-6700 / AMD Ryzen 5 1600',
      ram_gb: 12,
      gpu: 'GeForce GTX 1060 6GB / Radeon RX 580 8GB',
      storage_gb: 70
    }
  },
  {
    id: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    genre: 'CRPG',
    year: 2023,
    rating: 9.6,
    developer: 'Larian Studios',
    cover_emoji: '🎲',
    description: 'Партийная ролевая игра нового поколения по вселенной Dungeons & Dragons с бесконечной вариативностью.',
    tags: ['Turn-Based', 'Choices Matter', 'Fantasy', 'Co-op'],
    min_requirements: {
      os: 'Windows 10 64-bit',
      cpu: 'Intel Core i5-4690 / AMD FX 8350',
      ram_gb: 8,
      gpu: 'GeForce GTX 970 / Radeon RX 480',
      storage_gb: 150
    }
  },
  {
    id: 'the-witcher-3',
    title: 'The Witcher 3: Wild Hunt',
    genre: 'RPG / Action',
    year: 2015,
    rating: 9.5,
    developer: 'CD Projekt RED',
    cover_emoji: '⚔️',
    description: 'Легендарное приключение ведьмака Геральта из Ривии в мрачном славянском фэнтези.',
    tags: ['Masterpiece', 'Story Rich', 'Open World', 'Fantasy'],
    min_requirements: {
      os: 'Windows 7/8/10 64-bit',
      cpu: 'Intel CPU Core i5-2500K 3.3GHz / AMD Phenom II X4 940',
      ram_gb: 6,
      gpu: 'GeForce GTX 660 / Radeon HD 7870',
      storage_gb: 50
    }
  },
  {
    id: 'elden-ring',
    title: 'Elden Ring',
    genre: 'Action RPG / Souls-like',
    year: 2022,
    rating: 9.4,
    developer: 'FromSoftware',
    cover_emoji: '💍',
    description: 'Фэнтезийный экшен от создателей Dark Souls и Джорджа Мартина в бескрайних Междуземьях.',
    tags: ['Souls-like', 'Difficult', 'Dark Fantasy', 'Open World'],
    min_requirements: {
      os: 'Windows 10 64-bit',
      cpu: 'Intel Core i5-8400 / AMD Ryzen 3 3300X',
      ram_gb: 12,
      gpu: 'GeForce GTX 1060 3GB / Radeon RX 580 4GB',
      storage_gb: 60
    }
  },
  {
    id: 'hades-2',
    title: 'Hades II',
    genre: 'Roguelike / Action',
    year: 2024,
    rating: 9.3,
    developer: 'Supergiant Games',
    cover_emoji: '🔥',
    description: 'Динамичный рогалик в древнегреческом подземном мире. Сразитесь с титаном времени Кроносом!',
    tags: ['Roguelike', 'Fast-Paced', 'Mythology', 'Great Soundtrack'],
    min_requirements: {
      os: 'Windows 10 64-bit',
      cpu: 'Dual Core 2.4 GHz',
      ram_gb: 4,
      gpu: 'GeForce GTX 950 / Radeon R7 360 (2GB VRAM)',
      storage_gb: 10
    }
  },
  {
    id: 'hollow-knight',
    title: 'Hollow Knight',
    genre: 'Metroidvania',
    year: 2017,
    rating: 9.2,
    developer: 'Team Cherry',
    cover_emoji: '🪲',
    description: 'Атмосферное двухмерное приключение в полуразрушенном королевстве насекомых и героев.',
    tags: ['Metroidvania', 'Indie', 'Atmospheric', 'Difficult'],
    min_requirements: {
      os: 'Windows 7/8/10',
      cpu: 'Intel Core 2 Duo E5200',
      ram_gb: 4,
      gpu: 'GeForce 9800GTX+ (1GB)',
      storage_gb: 9
    }
  },
  {
    id: 'doom-eternal',
    title: 'DOOM Eternal',
    genre: 'Shooter / FPS',
    year: 2020,
    rating: 9.0,
    developer: 'id Software',
    cover_emoji: '💥',
    description: 'Невероятно яростный и скоростной шутер от первого лица. Уничтожайте демонов под тяжелый метал.',
    tags: ['FPS', 'Gore', 'Action', 'Fast-Paced'],
    min_requirements: {
      os: 'Windows 7/10 64-bit',
      cpu: 'Intel Core i5 @ 3.3 GHz / AMD Ryzen 3 @ 3.1 GHz',
      ram_gb: 8,
      gpu: 'GeForce GTX 1050Ti 4GB / Radeon R9 280 3GB',
      storage_gb: 80
    }
  },
  {
    id: 'red-dead-redemption-2',
    title: 'Red Dead Redemption 2',
    genre: 'Action / Adventure',
    year: 2019,
    rating: 9.7,
    developer: 'Rockstar Games',
    cover_emoji: '🤠',
    description: 'Грандиозная драма о закате эпохи Дикого Запада с непревзойденным уровнем проработки деталей.',
    tags: ['Western', 'Story Rich', 'Open World', 'Realistic'],
    min_requirements: {
      os: 'Windows 10 64-bit',
      cpu: 'Intel Core i5-2500K / AMD FX-6300',
      ram_gb: 8,
      gpu: 'GeForce GTX 770 2GB / Radeon R9 280 3GB',
      storage_gb: 150
    }
  },
  {
    id: 'half-life-alyx',
    title: 'Half-Life: Alyx',
    genre: 'VR / Shooter',
    year: 2020,
    rating: 9.3,
    developer: 'Valve',
    cover_emoji: '🥽',
    description: 'Флагманский VR-шутер от Valve во вселенной Half-Life, перевернувший стандарты виртуальной реальности.',
    tags: ['VR', 'Sci-Fi', 'Atmospheric', 'Horror'],
    min_requirements: {
      os: 'Windows 10',
      cpu: 'Intel Core i5-7500 / AMD Ryzen 5 1600',
      ram_gb: 12,
      gpu: 'GeForce GTX 1060 / Radeon RX 580 (6GB VRAM)',
      storage_gb: 70
    }
  },
  {
    id: 'factorio',
    title: 'Factorio',
    genre: 'Strategy / Simulator',
    year: 2020,
    rating: 9.8,
    developer: 'Wube Software',
    cover_emoji: '🏭',
    description: 'Инженерный симулятор постройки и автоматизации гигантских промышленных заводов на чужой планете.',
    tags: ['Automation', 'Base Building', 'Resource Management'],
    min_requirements: {
      os: 'Windows 10, 8, 7, Vista 64-bit',
      cpu: 'Dual core 3GHz+',
      ram_gb: 4,
      gpu: 'DirectX 11 capable graphics card (512MB VRAM)',
      storage_gb: 3
    }
  },
  {
    id: 'portal-2',
    title: 'Portal 2',
    genre: 'Puzzle / Adventure',
    year: 2011,
    rating: 9.9,
    developer: 'Valve',
    cover_emoji: '🌀',
    description: 'Инновационная пространственная головоломка с портальной пушкой, гениальным юмором и GLaDOS.',
    tags: ['Puzzle', 'Co-op', 'Comedy', 'Sci-Fi'],
    min_requirements: {
      os: 'Windows 7 / Vista / XP',
      cpu: '3.0 GHz P4, Dual Core 2.0 / AMD64X2',
      ram_gb: 2,
      gpu: 'Video card must be 128 MB or more with Pixel Shader 2.0b',
      storage_gb: 8
    }
  },
  {
    id: 'silent-hill-2-remake',
    title: 'Silent Hill 2 (Remake)',
    genre: 'Horror / Survival',
    year: 2024,
    rating: 8.8,
    developer: 'Bloober Team',
    cover_emoji: '🌫️',
    description: 'Психологический хоррор на Unreal Engine 5 о путешествии Джеймса Сандерленда в туманный город.',
    tags: ['Psychological Horror', 'Survival Horror', 'Atmospheric'],
    min_requirements: {
      os: 'Windows 10 64-bit',
      cpu: 'Intel Core i7-6700K / AMD Ryzen 5 3600',
      ram_gb: 16,
      gpu: 'GeForce GTX 1080 / Radeon RX 5700',
      storage_gb: 50
    }
  }
];

// Проверка работоспособности сервиса
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Game-Catalog-WebService',
    variant: 37,
    theme: 'Каталог видеоигр (поиск по жанрам и минимальным системным требованиям)',
    catalog_size: gamesCatalog.length,
    timestamp: new Date().toISOString()
  });
});

// Получение списка всех уникальных жанров
app.get('/api/genres', (req, res) => {
  const genresSet = new Set();
  gamesCatalog.forEach(game => {
    game.genre.split('/').map(g => g.trim()).forEach(g => genresSet.add(g));
  });
  res.json({
    success: true,
    count: genresSet.size,
    genres: Array.from(genresSet).sort()
  });
});

// Поиск и фильтрация игр по жанру, системным требованиям (RAM) и поисковому запросу
app.get('/api/catalog', (req, res) => {
  const { genre, max_ram_gb, q, min_rating } = req.query;
  
  let results = [...gamesCatalog];

  // Фильтрация по жанру (частичное совпадение)
  if (genre && genre !== 'all') {
    const targetGenre = genre.toLowerCase();
    results = results.filter(game => game.genre.toLowerCase().includes(targetGenre));
  }

  // Фильтрация по максимальным системным требованиям RAM (игры, которые потянет ПК пользователя)
  if (max_ram_gb) {
    const ramLimit = parseInt(max_ram_gb, 10);
    if (!isNaN(ramLimit)) {
      results = results.filter(game => game.min_requirements.ram_gb <= ramLimit);
    }
  }

  // Фильтрация по минимальному рейтингу
  if (min_rating) {
    const minRate = parseFloat(min_rating);
    if (!isNaN(minRate)) {
      results = results.filter(game => game.rating >= minRate);
    }
  }

  // Текстовый поиск по названию, тегам или описанию
  if (q) {
    const query = q.toLowerCase();
    results = results.filter(game =>
      game.title.toLowerCase().includes(query) ||
      game.description.toLowerCase().includes(query) ||
      game.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  res.json({
    success: true,
    applied_filters: {
      genre: genre || 'all',
      max_ram_gb: max_ram_gb ? `${max_ram_gb} GB` : 'unlimited',
      search_query: q || null,
      min_rating: min_rating || null
    },
    total: results.length,
    games: results
  });
});

// Получение конкретной игры по ID
app.get('/api/catalog/:id', (req, res) => {
  const game = gamesCatalog.find(g => g.id === req.params.id);
  if (!game) {
    return res.status(404).json({ success: false, message: 'Игра не найдена в каталоге' });
  }
  res.json({ success: true, game });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Web-Service] Сервис каталога видеоигр запущен на порту ${PORT}`);
});
