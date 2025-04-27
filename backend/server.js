
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db'); // Import the pool configured for Supabase

const app = express();
const PORT = process.env.PORT || 3001; // Vercel sets the PORT environment variable

// --- Middleware ---

// Configure CORS - Allow requests from your Vercel frontend URL
const allowedOrigins = [
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null, // Vercel deployment URL
    process.env.FRONTEND_URL, // Allow custom frontend URL from env
    'http://localhost:9002', // For local Next.js development
].filter(Boolean); // Filter out null/undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // or if the origin is in the allowed list or it's undefined (server-to-server or development tools)
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true)
    } else {
      console.warn(`CORS blocked for origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
};
app.use(cors(corsOptions));
// Log allowed origins
console.log("Allowed CORS origins:", allowedOrigins.join(', ') || "No specific origins set (check env vars)");


app.use(express.json()); // Parse JSON request bodies

// --- Password Check Middleware ---
const checkPassword = (req, res, next) => {
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return next();
  }
  const password = req.body.password || req.headers['x-admin-password']; // Check body or header
  const adminPassword = process.env.ADMIN_PASSWORD || "estrelas123"; // Default if not set

  if (!password) {
    console.log('Password attempt: Missing');
    return res.status(401).json({ error: 'Senha é obrigatória para esta ação.' });
  }

  if (password !== adminPassword) {
    console.log('Password attempt: Incorrect');
    return res.status(401).json({ error: 'Senha incorreta.' });
  }

  // If password matches, remove it from the body if present
  if (req.body.password) {
     delete req.body.password;
  }
  next();
};

// Helper function to validate DD/MM/YYYY format
const isValidDate = (dateStr) => {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr);
}
// Helper function to validate HH:MM format
const isValidTime = (timeStr) => {
    return /^\d{2}:\d{2}$/.test(timeStr);
}
// Helper function to validate URL format (basic check)
const isValidUrl = (urlStr) => {
    try {
        // Ensure it starts with http:// or https://
        if (!urlStr || (!urlStr.startsWith('http://') && !urlStr.startsWith('https://'))) {
            return false;
        }
        new URL(urlStr);
        return true;
    } catch (e) {
        return false;
    }
};


// --- API Routes for Eventos ---

// GET /api/eventos - List upcoming events for public view
app.get('/api/eventos', async (req, res) => {
  console.log(`Received GET request for /api/eventos from origin: ${req.headers.origin}`);
  try {
    // Fetch events, order by date ascending, limit 20
    // Date comparison logic for 'upcoming' should ideally happen in the query if data type allows,
    // but with VARCHAR 'DD/MM/YYYY' we sort alphabetically first, then filter/sort in code.
    // A better approach is to store dates as DATE type in PostgreSQL.
    // Assuming VARCHAR for now as per prompt.
    const { rows } = await pool.query('SELECT * FROM eventos'); // Fetch all first

    const parseDateString = (dateStr) => {
        try {
            if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
            const [day, month, year] = dateStr.split('/').map(Number);
            if (month < 1 || month > 12 || day < 1 || day > 31) return null; // Basic validation
            // Create date in UTC to avoid timezone issues during comparison
            const date = new Date(Date.UTC(year, month - 1, day));
             if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null; // Stricter validation
            return date;
        } catch (e) { return null; }
    };

    const today = new Date();
    // Set time to 00:00:00 UTC for comparison
    today.setUTCHours(0, 0, 0, 0);

    const filteredAndSortedEventos = rows
      .map(evento => ({
        ...evento,
        parsedDate: parseDateString(evento.data) // Parse the date string
      }))
      .filter(evento => evento.parsedDate && evento.parsedDate >= today) // Filter for valid, upcoming dates
      .sort((a, b) => (a.parsedDate ? a.parsedDate.getTime() : Infinity) - (b.parsedDate ? b.parsedDate.getTime() : Infinity)) // Sort by parsed date ascending
      .map(({ parsedDate, ...rest }) => rest); // Remove temporary parsedDate field

    console.log(`Sending ${Math.min(filteredAndSortedEventos.length, 20)} events for /api/eventos`);
    res.json(filteredAndSortedEventos.slice(0, 20)); // Apply limit
  } catch (error) {
    console.error('Error fetching public events:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos do banco de dados.' });
  }
});

// GET /api/eventos/all - List ALL events for CMS (sorted desc by date)
app.get('/api/eventos/all', async (req, res) => {
  console.log(`Received GET request for /api/eventos/all from origin: ${req.headers.origin}`);
  try {
    const { rows } = await pool.query('SELECT * FROM eventos'); // Fetch all

     const parseDateString = (dateStr) => {
        try {
            if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
            const [day, month, year] = dateStr.split('/').map(Number);
            if (month < 1 || month > 12 || day < 1 || day > 31) return null;
            const date = new Date(Date.UTC(year, month - 1, day));
             if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
            return date;
        } catch (e) { return null; }
    };

     const sortedEventos = rows
        .map(evento => ({
            ...evento,
            parsedDate: parseDateString(evento.data)
        }))
        .filter(evento => evento.parsedDate) // Filter out invalid dates
        // Sort descending
        .sort((a, b) => (b.parsedDate ? b.parsedDate.getTime() : -Infinity) - (a.parsedDate ? a.parsedDate.getTime() : -Infinity))
        .map(({ parsedDate, ...rest }) => rest); // Remove temporary parsedDate field

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
  console.log(`Received POST request for /api/eventos: ${titulo}`);

  if (!titulo || !data || !horario || !local) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios (titulo, data, horario, local).' });
  }
  if (!isValidDate(data)) {
    return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/YYYY.' });
  }
  if (!isValidTime(horario)) {
    return res.status(400).json({ error: 'Formato de horário inválido. Use HH:MM.' });
  }
   if (titulo.length > 100 || local.length > 100) {
      return res.status(400).json({ error: 'Título e Local não podem exceder 100 caracteres.' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO eventos (titulo, data, horario, local) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, data, horario, local]
    );
    console.log(`Event added successfully: ${rows[0].id}`);
    res.status(201).json({ message: 'Evento adicionado com sucesso!', evento: rows[0] });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Erro ao salvar evento no banco de dados.' });
  }
});

// PUT /api/eventos/:id - Update event (Password Protected)
app.put('/api/eventos/:id', checkPassword, async (req, res) => {
  const { id } = req.params;
  const { titulo, data, horario, local } = req.body;
  console.log(`Received PUT request for /api/eventos/${id}: ${titulo}`);

  if (!titulo || !data || !horario || !local) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }
  if (!isValidDate(data)) {
    return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/YYYY.' });
  }
   if (!isValidTime(horario)) {
    return res.status(400).json({ error: 'Formato de horário inválido. Use HH:MM.' });
  }
  if (titulo.length > 100 || local.length > 100) {
      return res.status(400).json({ error: 'Título e Local não podem exceder 100 caracteres.' });
  }

  try {
    const { rows, rowCount } = await pool.query(
      'UPDATE eventos SET titulo = $1, data = $2, horario = $3, local = $4 WHERE id = $5 RETURNING *',
      [titulo, data, horario, local, id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }
     console.log(`Event updated successfully: ${id}`);
    res.json({ message: 'Evento atualizado com sucesso!', evento: rows[0] });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Erro ao atualizar evento no banco de dados.' });
  }
});

// DELETE /api/eventos/:id - Delete event (Password Protected)
app.delete('/api/eventos/:id', checkPassword, async (req, res) => {
  const { id } = req.params;
  console.log(`Received DELETE request for /api/eventos/${id}`);

  try {
    // Password should be sent in the request body for DELETE as well, handled by checkPassword
    const { rowCount } = await pool.query('DELETE FROM eventos WHERE id = $1', [id]);
    if (rowCount === 0) {
       return res.status(404).json({ error: 'Evento não encontrado.' });
    }
    console.log(`Event deleted successfully: ${id}`);
    res.json({ message: 'Evento deletado com sucesso!' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Erro ao deletar evento do banco de dados.' });
  }
});


// --- API Routes for Noticias ---

// GET /api/noticias - List recent news for public view
app.get('/api/noticias', async (req, res) => {
   console.log(`Received GET request for /api/noticias from origin: ${req.headers.origin}`);
  try {
     // Assuming 'data' column is VARCHAR 'DD/MM/YYYY'
     // Fetch all, then sort and limit in code
    const { rows } = await pool.query('SELECT * FROM noticias');

     const parseDateString = (dateStr) => {
        try {
            if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
            const [day, month, year] = dateStr.split('/').map(Number);
             if (month < 1 || month > 12 || day < 1 || day > 31) return null;
             const date = new Date(Date.UTC(year, month - 1, day));
             if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
            return date;
        } catch (e) { return null; }
    };

     const sortedNoticias = rows
      .map(noticia => ({
        ...noticia,
        parsedDate: parseDateString(noticia.data)
      }))
      .filter(noticia => noticia.parsedDate) // Filter valid dates
      .sort((a, b) => (b.parsedDate ? b.parsedDate.getTime() : -Infinity) - (a.parsedDate ? a.parsedDate.getTime() : -Infinity)) // Sort DESC
      .map(({ parsedDate, ...rest }) => rest);

    console.log(`Sending ${Math.min(sortedNoticias.length, 10)} noticias for /api/noticias`);
    res.json(sortedNoticias.slice(0, 10)); // Apply limit
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Erro ao buscar notícias do banco de dados.' });
  }
});

// GET /api/noticias/all - List ALL news for CMS (sorted desc by date)
app.get('/api/noticias/all', async (req, res) => {
    console.log(`Received GET request for /api/noticias/all from origin: ${req.headers.origin}`);
    try {
        const { rows } = await pool.query('SELECT * FROM noticias'); // Fetch all

        const parseDateString = (dateStr) => {
           try {
               if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
               const [day, month, year] = dateStr.split('/').map(Number);
               if (month < 1 || month > 12 || day < 1 || day > 31) return null;
               const date = new Date(Date.UTC(year, month - 1, day));
                if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
               return date;
           } catch (e) { return null; }
        };

        const sortedNoticias = rows
            .map(noticia => ({
                ...noticia,
                parsedDate: parseDateString(noticia.data)
            }))
            .filter(noticia => noticia.parsedDate) // Filter valid dates
            // Sort descending
            .sort((a, b) => (b.parsedDate ? b.parsedDate.getTime() : -Infinity) - (a.parsedDate ? a.parsedDate.getTime() : -Infinity))
            .map(({ parsedDate, ...rest }) => rest); // Remove temporary parsedDate

        console.log(`Sending ${sortedNoticias.length} noticias for /api/noticias/all`);
        res.json(sortedNoticias);
    } catch (error) {
        console.error('Error fetching all news for CMS:', error);
        res.status(500).json({ error: 'Erro ao buscar todas as notícias para CMS.' });
    }
});


// POST /api/noticias - Create news item (Password Protected)
app.post('/api/noticias', checkPassword, async (req, res) => {
  const { titulo, texto, imagem, data } = req.body;
  console.log(`Received POST request for /api/noticias: ${titulo}`);

  if (!titulo || !texto || !imagem || !data) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios (titulo, texto, imagem, data).' });
  }
   if (!isValidDate(data)) {
    return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/YYYY.' });
  }
  if (!isValidUrl(imagem)) {
      return res.status(400).json({ error: 'URL da imagem inválida. Deve começar com http:// ou https://.' });
  }
   if (titulo.length > 100) {
      return res.status(400).json({ error: 'Título não pode exceder 100 caracteres.' });
  }
  if (imagem.length > 255) {
       return res.status(400).json({ error: 'URL da imagem não pode exceder 255 caracteres.' });
  }
  // No explicit length check for `texto` (TEXT type) unless required.

  try {
    const { rows } = await pool.query(
      'INSERT INTO noticias (titulo, texto, imagem, data) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, texto, imagem, data]
    );
     console.log(`Noticia added successfully: ${rows[0].id}`);
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
  console.log(`Received PUT request for /api/noticias/${id}: ${titulo}`);

  if (!titulo || !texto || !imagem || !data) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }
  if (!isValidDate(data)) {
    return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/YYYY.' });
  }
  if (!isValidUrl(imagem)) {
      return res.status(400).json({ error: 'URL da imagem inválida. Deve começar com http:// ou https://.' });
  }
   if (titulo.length > 100) {
      return res.status(400).json({ error: 'Título não pode exceder 100 caracteres.' });
  }
    if (imagem.length > 255) {
       return res.status(400).json({ error: 'URL da imagem não pode exceder 255 caracteres.' });
  }

  try {
    const { rows, rowCount } = await pool.query(
      'UPDATE noticias SET titulo = $1, texto = $2, imagem = $3, data = $4 WHERE id = $5 RETURNING *',
      [titulo, texto, imagem, data, id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Notícia não encontrada.' });
    }
    console.log(`Noticia updated successfully: ${id}`);
    res.json({ message: 'Notícia atualizada com sucesso!', noticia: rows[0] });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Erro ao atualizar notícia no banco de dados.' });
  }
});

// DELETE /api/noticias/:id - Delete news item (Password Protected)
app.delete('/api/noticias/:id', checkPassword, async (req, res) => {
  const { id } = req.params;
  console.log(`Received DELETE request for /api/noticias/${id}`);

  try {
    // Password handled by checkPassword middleware
    const { rowCount } = await pool.query('DELETE FROM noticias WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Notícia não encontrada.' });
    }
     console.log(`Noticia deleted successfully: ${id}`);
    res.json({ message: 'Notícia deletada com sucesso!' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'Erro ao deletar notícia do banco de dados.' });
  }
});


// --- Root Route (Optional: for health check) ---
app.get('/', (req, res) => {
  res.send('Estrelas do Campo Backend API is running!');
});

// --- 404 Handler for API routes ---
app.use('/api', (req, res, next) => {
  console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: `Endpoint não encontrado: ${req.method} ${req.originalUrl}` });
});


// --- Error Handling Middleware (Basic) ---
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err);
  if (err.message === 'Not allowed by CORS') {
      return res.status(403).json({ error: 'Acesso bloqueado pelo CORS.' });
  }
  res.status(err.status || 500).json({
      error: err.message || 'Algo deu errado no servidor!'
  });
});

// --- Start Server ---
// Vercel handles the listening part, so no app.listen() needed here for deployment
// app.listen(PORT, () => {
//   console.log(`Backend server potentially running on port ${PORT} locally`);
// });

// Export the app for Vercel Serverless Function
module.exports = app;
