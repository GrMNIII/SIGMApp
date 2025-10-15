import axios from 'axios';

export const BASE_URL = 'http://192.168.1.84:3000';
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});
