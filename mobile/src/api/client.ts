import axios from 'axios';

export const BASE_URL = 'http://localhost:3000'; // Cambia a tu IP si pruebas en móvil
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});
