import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Initialize CSRF token
(() => {
    axios.get('/sanctum/csrf-cookie').catch(error => {
        console.error('Failed to fetch CSRF token:', error);
    });
})();
