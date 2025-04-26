
'use client'; // Mark functions potentially used in client components

import axios from 'axios';
import type { Evento, Noticia } from '@/lib/types';

// Define the base URL for the backend API
// Use environment variable, fallback for local development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://estrelas-backend.onrender.com'; // Use Render URL as default
console.log("Using API Base URL:", API_BASE_URL); // Log the API URL being used

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Helper function to handle API errors ---
const handleApiError = (error: any, context: string): string => {
    let errorMessage = `Erro desconhecido em ${context}.`;
    if (axios.isAxiosError(error)) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(`API Error in ${context} (${error.response.status}):`, error.response.data);
            if (error.response.status === 404) {
                 errorMessage = `Recurso não encontrado (${error.response.status}) em ${context}. Verifique a URL da API e o endpoint. URL: ${error.config?.url}`;
            } else {
                // Try to get error message from backend response, fallback to status text
                errorMessage = error.response.data?.error || error.response.statusText || `Erro do servidor (${error.response.status}) em ${context}.`;
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error(`API Network Error in ${context}: No response received. Request URL: ${error.config?.url}`, error.request);
            errorMessage = `Não foi possível conectar ao servidor em ${context}. Verifique a conexão ou a URL da API (${API_BASE_URL}).`;
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error(`API Request Setup Error in ${context}:`, error.message);
            errorMessage = `Erro ao configurar a requisição para ${context}: ${error.message}`;
        }
    } else {
        // Non-Axios error
        console.error(`Non-API Error in ${context}:`, error);
        if (error instanceof Error) {
             errorMessage = `Ocorreu um erro inesperado em ${context}: ${error.message}`;
        } else {
             errorMessage = `Ocorreu um erro inesperado em ${context}.`;
        }
    }
    return errorMessage;
}


// --- API Functions for Eventos ---

// Fetch Events for public view (sorted by date asc, upcoming only)
export async function getEventosApi(): Promise<Evento[]> {
  const requestUrl = `${API_BASE_URL}/api/eventos`; // Construct the full URL for logging
  try {
    console.log(`Fetching events from: ${requestUrl}`); // Log the full request URL
    const response = await apiClient.get('/api/eventos');
    console.log("Events API response:", response.status, response.data);
    // Data should already be filtered and sorted by the backend for the public view
    return response.data;
  } catch (error: any) {
    const errorMessage = handleApiError(error, 'getEventosApi');
    console.error("getEventosApi Final Error:", errorMessage);
    // Consider returning sample data *only* for development/debugging if needed
    // if (process.env.NODE_ENV === 'development') { ... }
    throw new Error(errorMessage); // Throw error to be handled by UI
  }
}

// Fetch ALL Events for CMS (sorted by date desc)
export async function getAllEventosCMSApi(): Promise<Evento[]> {
     const requestUrl = `${API_BASE_URL}/api/eventos/all`;
     try {
        console.log(`Fetching all events for CMS from: ${requestUrl}`);
        const response = await apiClient.get('/api/eventos/all');
         console.log("All Events CMS API response:", response.status, response.data);
        return response.data;
    } catch (error: any) {
        const errorMessage = handleApiError(error, 'getAllEventosCMSApi');
        console.error("getAllEventosCMSApi Final Error:", errorMessage);
        throw new Error(errorMessage);
    }
}


// Add Event (requires password in data)
export async function addEventoApi(eventoData: Omit<Evento, 'id'>, password: string): Promise<Evento> {
  const requestUrl = `${API_BASE_URL}/api/eventos`;
  try {
    console.log(`Adding event via: ${requestUrl}`);
    const response = await apiClient.post('/api/eventos', { ...eventoData, password });
    console.log("Add Event API response:", response.status, response.data);
    return response.data.evento; // Assuming backend returns { message: '...', evento: {...} }
  } catch (error: any) {
     const errorMessage = handleApiError(error, 'addEventoApi');
     console.error("addEventoApi Final Error:", errorMessage);
     throw new Error(errorMessage);
  }
}

// Update Event (requires password in data)
export async function updateEventoApi(id: number | string, eventoData: Omit<Evento, 'id'>, password: string): Promise<Evento> {
   const requestUrl = `${API_BASE_URL}/api/eventos/${id}`;
   try {
    console.log(`Updating event ${id} via: ${requestUrl}`);
    const response = await apiClient.put(`/api/eventos/${id}`, { ...eventoData, password });
     console.log("Update Event API response:", response.status, response.data);
    return response.data.evento; // Assuming backend returns { message: '...', evento: {...} }
  } catch (error: any) {
    const errorMessage = handleApiError(error, `updateEventoApi (id: ${id})`);
    console.error("updateEventoApi Final Error:", errorMessage);
    throw new Error(errorMessage);
  }
}

// Delete Event (requires password in data, passed in body for consistency)
export async function deleteEventoApi(id: number | string, password: string): Promise<{ message: string }> {
   const requestUrl = `${API_BASE_URL}/api/eventos/${id}`;
   try {
    console.log(`Deleting event ${id} via: ${requestUrl}`);
    const response = await apiClient.delete(`/api/eventos/${id}`, {
        data: { password } // Send password in the data payload for DELETE
    });
    console.log("Delete Event API response:", response.status, response.data);
    return response.data; // Assuming backend returns { message: '...' }
  } catch (error: any) {
    const errorMessage = handleApiError(error, `deleteEventoApi (id: ${id})`);
    console.error("deleteEventoApi Final Error:", errorMessage);
    throw new Error(errorMessage);
  }
}

// --- API Functions for Noticias ---

// Fetch News for public view (sorted by date desc, limit 10)
export async function getNoticiasApi(): Promise<Noticia[]> {
  const requestUrl = `${API_BASE_URL}/api/noticias`;
  try {
    console.log(`Fetching noticias from: ${requestUrl}`);
    const response = await apiClient.get('/api/noticias');
    console.log("Noticias API response:", response.status, response.data);
    return response.data;
  } catch (error: any) {
    const errorMessage = handleApiError(error, 'getNoticiasApi');
    console.error("getNoticiasApi Final Error:", errorMessage);
     // Return empty array on error for now, but log the specific error
     // throw new Error(errorMessage); // Or throw to let UI handle
     return []; // Return empty array to prevent breaking page, but error is logged
  }
}

// Fetch ALL News for CMS (sorted by date desc)
export async function getAllNoticiasCMSApi(): Promise<Noticia[]> {
    const requestUrl = `${API_BASE_URL}/api/noticias/all`;
    try {
        console.log(`Fetching all noticias for CMS from: ${requestUrl}`);
        const response = await apiClient.get('/api/noticias/all');
        console.log("All Noticias CMS API response:", response.status, response.data);
        return response.data;
    } catch (error: any) {
        const errorMessage = handleApiError(error, 'getAllNoticiasCMSApi');
        console.error("getAllNoticiasCMSApi Final Error:", errorMessage);
        throw new Error(errorMessage);
    }
}

// Add News (requires password in data)
export async function addNoticiaApi(noticiaData: Omit<Noticia, 'id'>, password: string): Promise<Noticia> {
    const requestUrl = `${API_BASE_URL}/api/noticias`;
    try {
        console.log(`Adding noticia via: ${requestUrl}`);
        const response = await apiClient.post('/api/noticias', { ...noticiaData, password });
        console.log("Add Noticia API response:", response.status, response.data);
        return response.data.noticia; // Assuming backend returns { message: '...', noticia: {...} }
    } catch (error: any) {
        const errorMessage = handleApiError(error, 'addNoticiaApi');
        console.error("addNoticiaApi Final Error:", errorMessage);
        throw new Error(errorMessage);
    }
}

// Update News (requires password in data)
export async function updateNoticiaApi(id: number | string, noticiaData: Omit<Noticia, 'id'>, password: string): Promise<Noticia> {
    const requestUrl = `${API_BASE_URL}/api/noticias/${id}`;
    try {
        console.log(`Updating noticia ${id} via: ${requestUrl}`);
        const response = await apiClient.put(`/api/noticias/${id}`, { ...noticiaData, password });
        console.log("Update Noticia API response:", response.status, response.data);
        return response.data.noticia; // Assuming backend returns { message: '...', noticia: {...} }
    } catch (error: any) {
        const errorMessage = handleApiError(error, `updateNoticiaApi (id: ${id})`);
        console.error("updateNoticiaApi Final Error:", errorMessage);
        throw new Error(errorMessage);
    }
}

// Delete News (requires password in data)
export async function deleteNoticiaApi(id: number | string, password: string): Promise<{ message: string }> {
    const requestUrl = `${API_BASE_URL}/api/noticias/${id}`;
    try {
        console.log(`Deleting noticia ${id} via: ${requestUrl}`);
        const response = await apiClient.delete(`/api/noticias/${id}`, {
            data: { password } // Send password in the data payload for DELETE
        });
        console.log("Delete Noticia API response:", response.status, response.data);
        return response.data; // Assuming backend returns { message: '...' }
    } catch (error: any) {
        const errorMessage = handleApiError(error, `deleteNoticiaApi (id: ${id})`);
        console.error("deleteNoticiaApi Final Error:", errorMessage);
        throw new Error(errorMessage);
    }
}
