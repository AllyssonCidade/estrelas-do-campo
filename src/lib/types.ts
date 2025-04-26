

export type Evento = {
  id: number; // Changed to number for PostgreSQL SERIAL PRIMARY KEY
  titulo: string;
  data: string; // DD/MM/YYYY (kept as string based on current backend/frontend logic)
  horario: string; // HH:MM
  local: string;
};

// Updated Noticia type to align with PostgreSQL table
export type Noticia = {
  id: number; // Changed to number for PostgreSQL SERIAL PRIMARY KEY
  titulo: string;
  texto: string;
  imagem: string; // Image URL is now required based on table definition
  data: string; // DD/MM/YYYY
};

    