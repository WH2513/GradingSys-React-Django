import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // send HttpOnly cookies automatically

})

let isRefreshing = false; // flag to indicate if the token is being refreshed
let failedQueue = []; // store the requests that failed during the token refresh process

// function to process the failed requests
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
        failedQueue = [];
    });
};

api.interceptors.response.use(
    res => res, // pass through successful responses
    async (error) => { // handle errors where refresh happens
        console.log("REFRESH INTERCEPTOR HIT");
        debugger;

        const originalRequest = error.config;

        // 1. If login failed → show error, DO NOT refresh
        if (originalRequest.url.includes("/api/token/")) {
            throw error; // let your login form handle it
        }

        // 2. If refresh failed → logout
        if (originalRequest.url.includes("/api/token/refresh/")) {
            // refresh token invalid → force logout
            // e.g., redirect to login
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) { // the refresh is already happening, queue the request
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                });
            }

            // Start the refresh process
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // const refreshToken = ???
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/token/refresh/`);
                const newAccessToken = response.data.access;
                // localStorage.setItem(ACCESS_TOKEN, newAccessToken);

                api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
                processQueue(null, newAccessToken);

                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                // redirect to login
                window.location.href = '/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

// api.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem(ACCESS_TOKEN);
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`
//         }
//         return config
//     },
//     (error) => {
//         return Promise.reject(error)
//     }
// )

export default api;