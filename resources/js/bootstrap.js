import axios from 'axios';
import _ from 'lodash';

// Configure axios for Laravel
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// If using Vite with a different port than Laravel
if (import.meta.env.DEV) {
    axios.defaults.baseURL = 'http://127.0.0.1:8000';
}

// Export axios instance
window.axios = axios;

// Initialize CSRF protection
export async function initializeCsrf() {
    try {
        await axios.get('/sanctum/csrf-cookie');
    } catch (error) {
        console.error('Failed to initialize CSRF protection:', error);
    }
}

window._ = _;
