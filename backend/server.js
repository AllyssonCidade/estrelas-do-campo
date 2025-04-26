
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db'); // Import the pool from db.js

const app = express();
const PORT = process.env.PORT || 3001; // Use Render's port or default

// --- Middleware ---

// Configure CORS - Allow requests from your Firebase frontend URL
// Replace 'https://your-firebase-app-url.web.app' with your actual Firebase Hosting URL
// For local testing, you might allow 'http://localhost:9002' or '*' temporarily
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Use environment variable or allow all
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.use(express.json()); // Parse JSON request bodies

// --- Password Check Middleware ---
// Applies to POST, PUT, DELETE requests for /api/eventos and /api/noticias
const checkPassword = (req, res, next) => {
  // Check if password is required for this method
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return next(); // Skip password check for GET, etc.
  }

  // Extract password - check body first, then maybe query for DELETE if needed?
  // Consistent approach: expect password in body for all protected actions.
  const { password } = req.body;

  if (!password) {
      console.log('Password attempt: Missing');
      return res.status(401).json({ error: 'Senha é obrigatória para esta ação.' });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    console.log('Password attempt: Incorrect');
    return res.status(401).json({ error: 'Senha incorreta.' });
  }

  // If password matches, remove it from the body before proceeding
  // to avoid accidentally inserting/updating it into the database.
  // Important: This assumes the password field is named 'password'.
  delete req.body.password;
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
        new URL(urlStr);
        return true;
    } catch (e) {
        return false;
    }
};


// --- API Routes for Eventos ---

// GET /api/eventos - List upcoming events for public view
app.get('/api/eventos', async (req, res) => {
  try {
    // Fetch all events ordered by date ascending
    // The filtering for upcoming dates is handled client-side or can be added here
    const { rows } = await pool.query('SELECT * FROM eventos'); // Fetch all first

    // --- Date Parsing and Filtering Logic (moved from previous version) ---
    const parseDateString = (dateStr) => {
        try {
            if (typeof dateStr !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
            const [day, month, year] = dateStr.split('/').map(Number);
            if (month < 1 || month > 12 || day < 1 || day > 31) return null;
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
            return date;
        } catch (e) { return null; }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredAndSortedEventos = rows
      .map(evento => ({
        ...evento,
        parsedDate: parseDateString(evento.data)
      }))
      .filter(evento => evento.parsedDate && evento.parsedDate >= today) // Filter for today/future
      .sort((a, b) => (a.parsedDate ? a.parsedDate.getTime() : 0) - (b.parsedDate ? b.parsedDate.getTime() : 0)) // Sort ascending by date
      .map(({ parsedDate, ...rest }) => rest); // Remove temporary parsedDate
    // --- End Date Logic ---

    // Apply limit after filtering and sorting
    res.json(filteredAndSortedEventos.slice(0, 20));
  } catch (error) {
    console.error('Error fetching public events:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos do banco de dados.' });
  }
});

// GET /api/eventos/all - List ALL events for CMS (sorted desc)
app.get('/api/eventos/all', async (req, res) => {
  try {
    // Fetch all events, sort by date descending
    const { rows } = await pool.query('SELECT * FROM eventos'); // Fetch all

    // --- Date Parsing and Sorting Logic (moved from previous version) ---
     const parseDateString = (dateStr) => {
        try {
            if (typeof dateStr !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
            const [day, month, year] = dateStr.split('/').map(Number);
            if (month < 1 || month > 12 || day < 1 || day > 31) return null;
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
            return date;
        } catch (e) { return null; }
    };

     const sortedEventos = rows
        .map(evento => ({
            ...evento,
            parsedDate: parseDateString(evento.data)
        }))
        .filter(evento => evento.parsedDate) // Ensure date is valid before sorting
        .sort((a, b) => (b.parsedDate ? b.parsedDate.getTime() : 0) - (a.parsedDate ? a.parsedDate.getTime() : 0)) // Sort descending
        .map(({ parsedDate, ...rest }) => rest); // Remove temporary parsedDate
    // --- End Date Logic ---

    res.json(sortedEventos);
  } catch (error) {
    console.error('Error fetching all events for CMS:', error);
    res.status(500).json({ error: 'Erro ao buscar todos os eventos para CMS.' });
  }
});


// POST /api/eventos - Create event (Password Protected)
app.post('/api/eventos', checkPassword, async (req, res) => {
  const { titulo, data, horario, local } = req.body; // Password removed by middleware

  // Validation
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
    res.status(201).json({ message: 'Evento adicionado com sucesso!', evento: rows[0] });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Erro ao salvar evento no banco de dados.' });
  }
});

// PUT /api/eventos/:id - Update event (Password Protected)
app.put('/api/eventos/:id', checkPassword, async (req, res) => {
  const { id } = req.params;
  const { titulo, data, horario, local } = req.body; // Password removed by middleware

  // Validation
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
    const { rows, rowCount } = await pool.query(
      'UPDATE eventos SET titulo = $1, data = $2, horario = $3, local = $4 WHERE id = $5 RETURNING *',
      [titulo, data, horario, local, id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }
    res.json({ message: 'Evento atualizado com sucesso!', evento: rows[0] });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Erro ao atualizar evento no banco de dados.' });
  }
});

// DELETE /api/eventos/:id - Delete event (Password Protected)
// Expects password in the body (handled by checkPassword middleware)
app.delete('/api/eventos/:id', checkPassword, async (req, res) => {
  const { id } = req.params;
   // Password check done by middleware

  try {
    const { rowCount } = await pool.query('DELETE FROM eventos WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }
    res.json({ message: 'Evento deletado com sucesso!' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Erro ao deletar evento do banco de dados.' });
  }
});


// --- API Routes for Noticias ---

// GET /api/noticias - List recent news for public view
app.get('/api/noticias', async (req, res) => {
  try {
    // Fetch recent news, sorted by date descending, limit 10
    const { rows } = await pool.query('SELECT * FROM noticias ORDER BY data DESC LIMIT 10');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Erro ao buscar notícias do banco de dados.' });
  }
});

// GET /api/noticias/all - List ALL news for CMS (sorted desc)
app.get('/api/noticias/all', async (req, res) => {
    try {
        // Fetch all news, sorted by date descending
        const { rows } = await pool.query('SELECT * FROM noticias ORDER BY data DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching all news for CMS:', error);
        res.status(500).json({ error: 'Erro ao buscar todas as notícias para CMS.' });
    }
});


// POST /api/noticias - Create news item (Password Protected)
app.post('/api/noticias', checkPassword, async (req, res) => {
  const { titulo, texto, imagem, data } = req.body; // Password removed by middleware

  // Validation
  if (!titulo || !texto || !imagem || !data) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios (titulo, texto, imagem, data).' });
  }
   if (!isValidDate(data)) {
    return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/YYYY.' });
  }
  if (!isValidUrl(imagem)) {
      return res.status(400).json({ error: 'URL da imagem inválida.' });
  }
   if (titulo.length > 100) {
      return res.status(400).json({ error: 'Título não pode exceder 100 caracteres.' });
  }
  // Add length check for texto if needed

  try {
    const { rows } = await pool.query(
      'INSERT INTO noticias (titulo, texto, imagem, data) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, texto, imagem, data]
    );
    res.status(201).json({ message: 'Notícia adicionada com sucesso!', noticia: rows[0] });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ error: 'Erro ao salvar notícia no banco de dados.' });
  }
});

// PUT /api/noticias/:id - Update news item (Password Protected)
app.put('/api/noticias/:id', checkPassword, async (req, res) => {
  const { id } = req.params;
  const { titulo, texto, imagem, data } = req.body; // Password removed by middleware

  // Validation
  if (!titulo || !texto || !imagem || !data) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios (titulo, texto, imagem, data).' });
  }
  if (!isValidDate(data)) {
    return res.status(400).json({ error: 'Formato de data inválido. Use DD/MM/YYYY.' });
  }
    if (!isValidUrl(imagem)) {
      return res.status(400).json({ error: 'URL da imagem inválida.' });
  }
   if (titulo.length > 100) {
      return res.status(400).json({ error: 'Título não pode exceder 100 caracteres.' });
  }
  // Add length check for texto if needed

  try {
    const { rows, rowCount } = await pool.query(
      'UPDATE noticias SET titulo = $1, texto = $2, imagem = $3, data = $4 WHERE id = $5 RETURNING *',
      [titulo, texto, imagem, data, id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Notícia não encontrada.' });
    }
    res.json({ message: 'Notícia atualizada com sucesso!', noticia: rows[0] });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Erro ao atualizar notícia no banco de dados.' });
  }
});

// DELETE /api/noticias/:id - Delete news item (Password Protected)
// Expects password in the body (handled by checkPassword middleware)
app.delete('/api/noticias/:id', checkPassword, async (req, res) => {
  const { id } = req.params;
  // Password check done by middleware

  try {
    const { rowCount } = await pool.query('DELETE FROM noticias WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Notícia não encontrada.' });
    }
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

// --- Error Handling Middleware (Basic) ---
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).send('Algo deu errado no servidor!');
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Allowed frontend origin: ${corsOptions.origin}`);
});

    