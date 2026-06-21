import axios from 'axios'

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: { 'Content-Type': 'application/json' }
})

export default api

export const STORE_ID = '51aed065-b215-48ce-8f42-753ef4464fe5'
