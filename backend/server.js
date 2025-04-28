
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db'); // Import the pool configured for Supabase

const app = express();
const PORT = process.env.PORT || 3001; // Vercel sets the PORT environment variable

// --- Middleware ---

// Configure CORS - Allow requests from Vercel deployment URL and localhost
const allowedOrigins = [
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null, // Vercel deployment URL
    process.env.NEXT_PUBLIC_FRONTEND_URL, // Allow custom frontend URL from env (e.g., https://estrelas-app.web.app)
    'http://localhost:9002', // For local Next.js development
].filter(Boolean); // Filter out null/undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl) or if origin is in the allowed list
    // Vercel preview URLs might have different origins, consider a more dynamic approach if needed
    // For development, '*' might be easier, but restrict in production.
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true)
    } else {
      console.warn(`CORS blocked for origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true // If you need cookies or authorization headers
};
app.use(cors(corsOptions));
console.log("Allowed CORS origins:", allowedOrigins.join(', '));


app.use(express.json()); // Parse JSON request bodies

// --- Password Check Middleware ---
const checkPassword = (req, res, next) => {
  // Check if the method requires password protection
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return next();
  }

  // Extract password from body or header
  const password = req.body.password || req.headers['x-admin-password'];
  // Use environment variable for admin password, fallback to default only if not set
  const adminPassword = process.env.ADMIN_PASSWORD || "estrelas123";

  if (!password) {
    console.warn('Admin action password attempt: Missing');
    return res.status(401).json({ error: 'Senha é obrigatória para esta ação.' });
  }

  if (password !== adminPassword) {
    console.warn('Admin action password attempt: Incorrect');
    return res.status(403).json({ error: 'Senha incorreta.' }); // Use 403 Forbidden for incorrect password
  }

  // Password is correct, remove it from body if present so it's not processed further
  if (req.body.password) {
     delete req.body.password;
  }
  console.log(`Admin action authorized for ${req.method} ${req.path}`);
  next();
};

// --- Validation Helpers ---
const isValidDate = (dateStr) => /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr);
const isValidTime = (timeStr) => /^\d{2}:\d{2}$/.test(timeStr);
const isValidUrl = (urlStr) => {
  if (!urlStr) return false;
  try {
    const url = new URL(urlStr);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (_) {
    return false;
  }
};

// Helper to parse DD/MM/YYYY to Date object for sorting
const parseDateString = (dateStr) => {
    if (!dateStr || !isValidDate(dateStr)) return null;
    try {
        const [day, month, year] = dateStr.split('/').map(Number);
        // Create date in UTC to avoid timezone issues during comparison
        const date = new Date(Date.UTC(year, month - 1, day));
        // Validate parts again after Date object creation
        if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
             return null; // Invalid date parts (e.g., 31/02/2025)
        }
        return date;
    } catch (e) {
        console.error(`Error parsing date string "${dateStr}":`, e);
        return null;
    }
};


// --- API Routes for Eventos ---

// GET /api/eventos - List upcoming events for public view (sorted asc by date)
app.get('/api/eventos', async (req, res) => {
  console.log(`GET /api/eventos requested from origin: ${req.headers.origin}`);
  try {
    // Fetch all events first, as filtering/sorting by DD/MM/YYYY string in SQL is unreliable
    const { rows } = await pool.query('SELECT * FROM eventos');

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Compare against start of today UTC

    const upcomingEventos = rows
      .map(evento => ({
        ...evento,
        parsedDate: parseDateString(evento.data) // Parse the date string
      }))
      .filter(evento => evento.parsedDate && evento.parsedDate >= today) // Filter for valid, upcoming dates
      .sort((a, b) => (a.parsedDate?.getTime() ?? Infinity) - (b.parsedDate?.getTime() ?? Infinity)) // Sort by parsed date ascending
      .map(({ parsedDate, ...rest }) => rest); // Remove temporary parsedDate field

    console.log(`Sending ${Math.min(upcomingEventos.length, 20)} events for /api/eventos`);
    res.json(upcomingEventos.slice(0, 20)); // Apply limit
  } catch (error) {
    console.error('Error fetching public events:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos do banco de dados.' });
  }
});

// GET /api/eventos/all - List ALL events for CMS (sorted desc by date)
app.get('/api/eventos/all', async (req, res) => {
  console.log(`GET /api/eventos/all requested from origin: ${req.headers.origin}`);
  try {
    const { rows } = await pool.query('SELECT * FROM eventos');

     const sortedEventos = rows
        .map(evento => ({ ...evento, parsedDate: parseDateString(evento.data) }))
        .filter(evento => evento.parsedDate) // Ensure valid dates
        // Sort descending
        .sort((a, b) => (b.parsedDate?.getTime() ?? -Infinity) - (a.parsedDate?.getTime() ?? -Infinity))
        .map(({ parsedDate, ...rest }) => rest); // Remove temporary field

    console.log(`Sending ${sortedEventos.length} events for /api/eventos/all`);
    res.json(sortedEventos);
  } catch (error) {
    console.error('Error fetching all events for CMS:', error);
    res.status(500).json({ error: 'Erro ao buscar todos os eventos para CMS.' });
  }
});


// POST /api/eventos - Create event (Password Protected)
app.post('/api/eventos', checkPassword, async (req, res) => {
  const { titulo, data, horario, local } = req.body; // Password removed by middleware
  console.log(`POST /api/eventos: ${titulo}`);

  // Validation
  if (!titulo || !data || !horario || !local) return res.status(400).json({ error: 'Todos os campos são obrigatórios (titulo, data, horario, local).' });
  if (!isValidDate(data)) return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/YYYY.' });
  if (!isValidTime(horario)) return res.status(400).json({ error: 'Formato de horário inválido. Use HH:MM.' });
  if (titulo.length > 100 || local.length > 100) return res.status(400).json({ error: 'Título e Local não podem exceder 100 caracteres.' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO eventos (titulo, data, horario, local) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, data, horario, local]
    );
    console.log(`Event added successfully: ID ${rows[0].id}`);
    res.status(201).json({ message: 'Evento adicionado com sucesso!', evento: rows[0] });
  } catch (error) {
    console.error('Error creating event:', error);
    // Check for specific DB errors if needed (e.g., unique constraint)
    res.status(500).json({ error: 'Erro ao salvar evento no banco de dados.' });
  }
});

// PUT /api/eventos/:id - Update event (Password Protected)
app.put('/api/eventos/:id', checkPassword, async (req, res) => {
  const { id } = req.params;
  const { titulo, data, horario, local } = req.body;
  console.log(`PUT /api/eventos/${id}: ${titulo}`);

  // Validation
  if (!titulo || !data || !horario || !local) return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  if (!isValidDate(data)) return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/YYYY.' });
  if (!isValidTime(horario)) return res.status(400).json({ error: 'Formato de horário inválido. Use HH:MM.' });
  if (titulo.length > 100 || local.length > 100) return res.status(400).json({ error: 'Título e Local não podem exceder 100 caracteres.' });
  if (isNaN(parseInt(id))) return res.status(400).json({ error: 'ID do evento inválido.' });

  try {
    const { rows, rowCount } = await pool.query(
      'UPDATE eventos SET titulo = $1, data = $2, horario = $3, local = $4 WHERE id = $5 RETURNING *',
      [titulo, data, horario, local, id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }
    console.log(`Event updated successfully: ID ${id}`);
    res.json({ message: 'Evento atualizado com sucesso!', evento: rows[0] });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Erro ao atualizar evento no banco de dados.' });
  }
});

// DELETE /api/eventos/:id - Delete event (Password Protected)
app.delete('/api/eventos/:id', checkPassword, async (req, res) => {
  const { id } = req.params;
  console.log(`DELETE /api/eventos/${id}`);

  if (isNaN(parseInt(id))) return res.status(400).json({ error: 'ID do evento inválido.' });

  try {
    // Password check is done by middleware
    const { rowCount } = await pool.query('DELETE FROM eventos WHERE id = $1', [id]);
    if (rowCount === 0) {
       return res.status(404).json({ error: 'Evento não encontrado.' });
    }
    console.log(`Event deleted successfully: ID ${id}`);
    // Send password in body or header - middleware handles extraction
    // No need to include it in the query itself
    res.json({ message: 'Evento deletado com sucesso!' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Erro ao deletar evento do banco de dados.' });
  }
});


// --- API Routes for Noticias ---

// GET /api/noticias - List recent news for public view (sorted desc by date)
app.get('/api/noticias', async (req, res) => {
   console.log(`GET /api/noticias requested from origin: ${req.headers.origin}`);
  try {
    // Fetch all, then sort and limit in code due to DD/MM/YYYY string format
    const { rows } = await pool.query('SELECT * FROM noticias');

     const sortedNoticias = rows
      .map(noticia => ({ ...noticia, parsedDate: parseDateString(noticia.data) }))
      .filter(noticia => noticia.parsedDate) // Ensure valid dates
      .sort((a, b) => (b.parsedDate?.getTime() ?? -Infinity) - (a.parsedDate?.getTime() ?? -Infinity)) // Sort DESC
      .map(({ parsedDate, ...rest }) => rest); // Remove temporary field

    console.log(`Sending ${Math.min(sortedNoticias.length, 10)} noticias for /api/noticias`);
    res.json(sortedNoticias.slice(0, 10)); // Apply limit
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Erro ao buscar notícias do banco de dados.' });
  }
});

// GET /api/noticias/all - List ALL news for CMS (sorted desc by date)
app.get('/api/noticias/all', async (req, res) => {
    console.log(`GET /api/noticias/all requested from origin: ${req.headers.origin}`);
    try {
        const { rows } = await pool.query('SELECT * FROM noticias');

        const sortedNoticias = rows
            .map(noticia => ({ ...noticia, parsedDate: parseDateString(noticia.data) }))
            .filter(noticia => noticia.parsedDate) // Ensure valid dates
            .sort((a, b) => (b.parsedDate?.getTime() ?? -Infinity) - (a.parsedDate?.getTime() ?? -Infinity)) // Sort DESC
            .map(({ parsedDate, ...rest }) => rest); // Remove temporary field

        console.log(`Sending ${sortedNoticias.length} noticias for /api/noticias/all`);
        res.json(sortedNoticias);
    } catch (error) {
        console.error('Error fetching all news for CMS:', error);
        res.status(500).json({ error: 'Erro ao buscar todas as notícias para CMS.' });
    }
});


// POST /api/noticias - Create news item (Password Protected)
app.post('/api/noticias', checkPassword, async (req, res) => {
  const { titulo, texto, imagem, data } = req.body; // Password removed by middleware
  console.log(`POST /api/noticias: ${titulo}`);

  // Validation
  if (!titulo || !texto || !imagem || !data) return res.status(400).json({ error: 'Todos os campos são obrigatórios (titulo, texto, imagem, data).' });
  if (!isValidDate(data)) return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/YYYY.' });
  if (!isValidUrl(imagem)) return res.status(400).json({ error: 'URL da imagem inválida. Deve começar com http:// ou https://.' });
  if (titulo.length > 100) return res.status(400).json({ error: 'Título não pode exceder 100 caracteres.' });
  if (imagem.length > 255) return res.status(400).json({ error: 'URL da imagem não pode exceder 255 caracteres.' });
  // TEXT type for 'texto' usually doesn't need strict length check unless specified

  try {
    const { rows } = await pool.query(
      'INSERT INTO noticias (titulo, texto, imagem, data) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, texto, imagem, data]
    );
     console.log(`Noticia added successfully: ID ${rows[0].id}`);
    res.status(201).json({ message: 'Notícia adicionada com sucesso!', noticia: rows[0] });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ error: 'Erro ao salvar notícia no banco de dados.' });
  }
});

// PUT /api/noticias/:id - Update news item (Password Protected)
app.put('/api/noticias/:id', checkPassword, async (req, res) => {
  const { id } = req.params;
  const { titulo, texto, imagem, data } = req.body;
  console.log(`PUT /api/noticias/${id}: ${titulo}`);

  // Validation
  if (!titulo || !texto || !imagem || !data) return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  if (!isValidDate(data)) return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/YYYY.' });
  if (!isValidUrl(imagem)) return res.status(400).json({ error: 'URL da imagem inválida. Deve começar com http:// ou https://.' });
  if (titulo.length > 100) return res.status(400).json({ error: 'Título não pode exceder 100 caracteres.' });
  if (imagem.length > 255) return res.status(400).json({ error: 'URL da imagem não pode exceder 255 caracteres.' });
  if (isNaN(parseInt(id))) return res.status(400).json({ error: 'ID da notícia inválido.' });

  try {
    const { rows, rowCount } = await pool.query(
      'UPDATE noticias SET titulo = $1, texto = $2, imagem = $3, data = $4 WHERE id = $5 RETURNING *',
      [titulo, texto, imagem, data, id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Notícia não encontrada.' });
    }
    console.log(`Noticia updated successfully: ID ${id}`);
    res.json({ message: 'Notícia atualizada com sucesso!', noticia: rows[0] });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Erro ao atualizar notícia no banco de dados.' });
  }
});

// DELETE /api/noticias/:id - Delete news item (Password Protected)
app.delete('/api/noticias/:id', checkPassword, async (req, res) => {
  const { id } = req.params;
  console.log(`DELETE /api/noticias/${id}`);

  if (isNaN(parseInt(id))) return res.status(400).json({ error: 'ID da notícia inválido.' });

  try {
    // Password check done by middleware
    const { rowCount } = await pool.query('DELETE FROM noticias WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Notícia não encontrada.' });
    }
    console.log(`Noticia deleted successfully: ID ${id}`);
    res.json({ message: 'Notícia deletada com sucesso!' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'Erro ao deletar notícia do banco de dados.' });
  }
});


// --- Root Route (Optional: for basic health check) ---
app.get('/', (req, res) => {
  res.send('Estrelas do Campo Backend API is running!');
});

// --- API Base Route (Optional: for API health check) ---
app.get('/api', (req, res) => {
  res.json({ message: 'Estrelas do Campo API is available.' });
});

// --- 404 Handler for API routes ---
// This should come after all defined API routes
app.use('/api', (req, res, next) => {
  console.warn(`404 API Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Endpoint API não encontrado: ${req.method} ${req.originalUrl}` });
});


// --- Generic Error Handling Middleware ---
// This should be the last middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err);
  // Handle specific error types if needed
  if (err.message === 'Not allowed by CORS') {
      return res.status(403).json({ error: 'Acesso bloqueado pelo CORS.' });
  }
  // Default error response
  res.status(err.status || 500).json({
      error: err.message || 'Ocorreu um erro interno no servidor.'
  });
});

// --- Start Server ---
// Vercel handles the listening part when deployed as a serverless function.
// This listen call is primarily for local development.
// if (process.env.NODE_ENV !== 'production') { // Only listen locally if not in Vercel context
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
// }

// Export the app for Vercel Serverless Function
module.exports = app;
