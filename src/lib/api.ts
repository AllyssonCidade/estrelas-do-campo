
'use client'; // Mark functions potentially used in client components

import axios from 'axios';
import type { Evento, Noticia } from '@/lib/types';

// Define the base URL for the backend API using environment variable
// Vercel automatically provides VERCEL_URL for the backend deployment.
// NEXT_PUBLIC_API_URL should be set in Vercel env vars for the frontend pointing to the backend URL.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
    console.error("NEXT_PUBLIC_API_URL environment variable is not set. API calls will likely fail.");
    // Consider throwing an error during build or providing a fallback for local dev if needed
    // throw new Error("NEXT_PUBLIC_API_URL is not defined");
}
console.log("API Client using Base URL:", API_BASE_URL); // Log the API URL being used

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout?
  // timeout: 5000, // e.g., 5 seconds
});

// --- Helper function to handle API errors ---
const handleApiError = (error: any, context: string): string => {
    let errorMessage = `Erro desconhecido em ${context}.`;
    if (axios.isAxiosError(error)) {
        console.error(`Axios error in ${context}:`, error.message);
        if (error.response) {
            // Server responded with a status code outside the 2xx range
            console.error(`API Error in ${context} (${error.response.status}): Response data:`, error.response.data);

             // Check if the response data is an object and has an 'error' property (common pattern)
            if (typeof error.response.data === 'object' && error.response.data?.error) {
                errorMessage = error.response.data.error;
            }
            // Handle HTML error response (like Vercel/Express 404 page)
            else if (typeof error.response.data === 'string' && error.response.data.startsWith('<!DOCTYPE html>')) {
                 errorMessage = `Endpoint não encontrado (${error.response.status}) ou erro no servidor em ${context}. Verifique a URL: ${error.config?.url}`;
            }
            else if (error.response.status === 404) {
                errorMessage = `Endpoint não encontrado (${error.response.status}) em ${context}. Verifique a URL: ${error.config?.url}`;
            }
            else if (error.response.status === 401 || error.response.status === 403) {
                errorMessage = `Erro de autenticação (${error.response.status}) em ${context}. Senha incorreta ou não fornecida.`;
            }
             else {
                // Fallback to status text or a generic message
                errorMessage = `Erro do servidor (${error.response.status}) em ${context}.`;
            }
        } else if (error.request) {
            // No response received (Network Error, Timeout, CORS issue at network level)
             console.error(`API Network Error in ${context}: No response received. Is the backend running and accessible at ${API_BASE_URL}? Is CORS configured correctly on the backend? Request URL: ${error.config?.url}`, error.request);
             errorMessage = `Não foi possível conectar ao servidor (${context}). Verifique sua conexão e se o backend (${API_BASE_URL}) está online e acessível.`;
             // More specific messages based on error code?
             if (error.code === 'ECONNABORTED') {
                 errorMessage = `A requisição para ${context} demorou muito (${error.config?.timeout}ms). Tente novamente.`;
             }
        } else {
            // Error setting up the request
            console.error(`API Request Setup Error in ${context}:`, error.message);
            errorMessage = `Erro ao configurar a requisição para ${context}: ${error.message}`;
        }
    } else if (error instanceof Error) {
        // Non-Axios error (e.g., JSON parsing error in response, code errors before request)
        console.error(`Non-API Error in ${context}:`, error);
        errorMessage = `Ocorreu um erro inesperado (${context}): ${error.message}`;
    } else {
         // Error is of an unknown type
         console.error(`Unknown Error type in ${context}:`, error);
         errorMessage = `Ocorreu um erro inesperado (${context}).`;
    }
    return errorMessage;
}


// --- API Functions for Eventos ---

// Fetch Events for public view (sorted by date asc, upcoming only, limit 20)
export async function getEventosApi(): Promise<Evento[]> {
  if (!API_BASE_URL) return Promise.reject(new Error("API URL não configurada."));
  const endpoint = '/api/eventos';
  try {
    console.log(`Fetching events from: ${API_BASE_URL}${endpoint}`);
    const response = await apiClient.get(endpoint);
     // Check if response.data is actually an array
    if (!Array.isArray(response.data)) {
       console.error("API response for events is not an array:", response.data);
       throw new Error("Resposta inesperada do servidor ao buscar eventos.");
    }
    console.log("Events API response:", response.status);
    return response.data;
  } catch (error: any) {
    const errorMessage = handleApiError(error, 'getEventosApi');
    console.error("getEventosApi Final Error:", errorMessage);
    throw new Error(errorMessage); // Throw error to be handled by UI
  }
}

// Fetch ALL Events for CMS (sorted by date desc)
export async function getAllEventosCMSApi(): Promise<Evento[]> {
    if (!API_BASE_URL) return Promise.reject(new Error("API URL não configurada."));
    const endpoint = '/api/eventos/all';
     try {
        console.log(`Fetching all events for CMS from: ${API_BASE_URL}${endpoint}`);
        const response = await apiClient.get(endpoint);
         if (!Array.isArray(response.data)) {
            console.error("API response for all events CMS is not an array:", response.data);
            throw new Error("Resposta inesperada do servidor ao buscar todos os eventos.");
        }
        console.log("All Events CMS API response:", response.status);
        return response.data;
    } catch (error: any) {
        const errorMessage = handleApiError(error, 'getAllEventosCMSApi');
        console.error("getAllEventosCMSApi Final Error:", errorMessage);
        throw new Error(errorMessage);
    }
}


// Add Event (requires password)
export async function addEventoApi(eventoData: Omit<Evento, 'id'>, password: string): Promise<Evento> {
  if (!API_BASE_URL) return Promise.reject(new Error("API URL não configurada."));
  const endpoint = '/api/eventos';
  try {
    console.log(`Adding event via: ${API_BASE_URL}${endpoint}`);
    // Send password in the body, as expected by the backend middleware
    const response = await apiClient.post(endpoint, { ...eventoData, password });
    console.log("Add Event API response:", response.status, response.data);
    if (!response.data || !response.data.evento) {
         throw new Error("Resposta inválida do servidor ao adicionar evento.");
    }
    return response.data.evento;
  } catch (error: any) {
     const errorMessage = handleApiError(error, 'addEventoApi');
     console.error("addEventoApi Final Error:", errorMessage);
     throw new Error(errorMessage);
  }
}

// Update Event (requires password)
export async function updateEventoApi(id: number | string, eventoData: Omit<Evento, 'id'>, password: string): Promise<Evento> {
   if (!API_BASE_URL) return Promise.reject(new Error("API URL não configurada."));
   const endpoint = `/api/eventos/${id}`;
   try {
    console.log(`Updating event ${id} via: ${API_BASE_URL}${endpoint}`);
     // Send password in the body
    const response = await apiClient.put(endpoint, { ...eventoData, password });
     console.log("Update Event API response:", response.status, response.data);
     if (!response.data || !response.data.evento) {
         throw new Error("Resposta inválida do servidor ao atualizar evento.");
    }
    return response.data.evento;
  } catch (error: any) {
    const errorMessage = handleApiError(error, `updateEventoApi (id: ${id})`);
    console.error("updateEventoApi Final Error:", errorMessage);
    throw new Error(errorMessage);
  }
}

// Delete Event (requires password)
export async function deleteEventoApi(id: number | string, password: string): Promise<{ message: string }> {
   if (!API_BASE_URL) return Promise.reject(new Error("API URL não configurada."));
   const endpoint = `/api/eventos/${id}`;
   try {
    console.log(`Deleting event ${id} via: ${API_BASE_URL}${endpoint}`);
    // Send password in the data payload for DELETE, as configured in the backend
    // Or use headers: { 'X-Admin-Password': password } if backend expects header
    const response = await apiClient.delete(endpoint, {
        data: { password } // Sending password in the body for DELETE
        // headers: { 'X-Admin-Password': password } // Alternative if using header
    });
    console.log("Delete Event API response:", response.status, response.data);
     if (!response.data || !response.data.message) {
         throw new Error("Resposta inválida do servidor ao deletar evento.");
    }
    return response.data;
  } catch (error: any) {
    const errorMessage = handleApiError(error, `deleteEventoApi (id: ${id})`);
    console.error("deleteEventoApi Final Error:", errorMessage);
    throw new Error(errorMessage);
  }
}

// --- API Functions for Noticias ---

// Fetch News for public view (sorted by date desc, limit 10)
export async function getNoticiasApi(): Promise<Noticia[]> {
  if (!API_BASE_URL) return Promise.reject(new Error("API URL não configurada."));
  const endpoint = '/api/noticias';
  try {
    console.log(`Fetching noticias from: ${API_BASE_URL}${endpoint}`);
    const response = await apiClient.get(endpoint);
     if (!Array.isArray(response.data)) {
       console.error("API response for noticias is not an array:", response.data);
       throw new Error("Resposta inesperada do servidor ao buscar notícias.");
    }
    console.log("Noticias API response:", response.status);
    return response.data;
  } catch (error: any) {
    const errorMessage = handleApiError(error, 'getNoticiasApi');
    console.error("getNoticiasApi Final Error:", errorMessage);
     // Decide how to handle: throw error or return empty array? Throwing is usually better for UI feedback.
     throw new Error(errorMessage);
  }
}

// Fetch ALL News for CMS (sorted by date desc)
export async function getAllNoticiasCMSApi(): Promise<Noticia[]> {
    if (!API_BASE_URL) return Promise.reject(new Error("API URL não configurada."));
    const endpoint = '/api/noticias/all';
    try {
        console.log(`Fetching all noticias for CMS from: ${API_BASE_URL}${endpoint}`);
        const response = await apiClient.get(endpoint);
         if (!Array.isArray(response.data)) {
            console.error("API response for all noticias CMS is not an array:", response.data);
            throw new Error("Resposta inesperada do servidor ao buscar todas as notícias.");
        }
        console.log("All Noticias CMS API response:", response.status);
        return response.data;
    } catch (error: any) {
        const errorMessage = handleApiError(error, 'getAllNoticiasCMSApi');
        console.error("getAllNoticiasCMSApi Final Error:", errorMessage);
        throw new Error(errorMessage);
    }
}

// Add News (requires password)
export async function addNoticiaApi(noticiaData: Omit<Noticia, 'id'>, password: string): Promise<Noticia> {
    if (!API_BASE_URL) return Promise.reject(new Error("API URL não configurada."));
    const endpoint = '/api/noticias';
    try {
        console.log(`Adding noticia via: ${API_BASE_URL}${endpoint}`);
        // Send password in the body
        const response = await apiClient.post(endpoint, { ...noticiaData, password });
        console.log("Add Noticia API response:", response.status, response.data);
        if (!response.data || !response.data.noticia) {
             throw new Error("Resposta inválida do servidor ao adicionar notícia.");
        }
        return response.data.noticia;
    } catch (error: any) {
        const errorMessage = handleApiError(error, 'addNoticiaApi');
        console.error("addNoticiaApi Final Error:", errorMessage);
        throw new Error(errorMessage);
    }
}

// Update News (requires password)
export async function updateNoticiaApi(id: number | string, noticiaData: Omit<Noticia, 'id'>, password: string): Promise<Noticia> {
    if (!API_BASE_URL) return Promise.reject(new Error("API URL não configurada."));
    const endpoint = `/api/noticias/${id}`;
    try {
        console.log(`Updating noticia ${id} via: ${API_BASE_URL}${endpoint}`);
        // Send password in the body
        const response = await apiClient.put(endpoint, { ...noticiaData, password });
        console.log("Update Noticia API response:", response.status, response.data);
         if (!response.data || !response.data.noticia) {
            throw new Error("Resposta inválida do servidor ao atualizar notícia.");
        }
        return response.data.noticia;
    } catch (error: any) {
        const errorMessage = handleApiError(error, `updateNoticiaApi (id: ${id})`);
        console.error("updateNoticiaApi Final Error:", errorMessage);
        throw new Error(errorMessage);
    }
}

// Delete News (requires password)
export async function deleteNoticiaApi(id: number | string, password: string): Promise<{ message: string }> {
    if (!API_BASE_URL) return Promise.reject(new Error("API URL não configurada."));
    const endpoint = `/api/noticias/${id}`;
    try {
        console.log(`Deleting noticia ${id} via: ${API_BASE_URL}${endpoint}`);
         // Send password in the data payload for DELETE
        const response = await apiClient.delete(endpoint, {
            data: { password }
            // headers: { 'X-Admin-Password': password } // Alternative
        });
        console.log("Delete Noticia API response:", response.status, response.data);
         if (!response.data || !response.data.message) {
             throw new Error("Resposta inválida do servidor ao deletar notícia.");
        }
        return response.data;
    } catch (error: any) {
        const errorMessage = handleApiError(error, `deleteNoticiaApi (id: ${id})`);
        console.error("deleteNoticiaApi Final Error:", errorMessage);
        throw new Error(errorMessage);
    }
}
