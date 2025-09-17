import axios from "axios";
import { store } from "../store/store";
import { loginSuccess, logout } from "../features/authSlice";

const getAccessToken = () => {
    return store.getState().auth.accessToken;
}

export const api = axios.create({
    baseURL : "http://localhost:8081", 
    withCredentials: true 
})


api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, 
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response, 
    async (err) => {
        const originalRequest = err.config;

        if(err.response?.status === 401){
            try{
                const response = await axios.post(`http://localhost:8081/auth/tokens/refresh`,{},{
                    withCredentials:true
                });                
                store.dispatch(loginSuccess(response.data))
                return api(originalRequest);
            }catch(refreshError){
                store.dispatch(logout());
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(err);
    } 
)