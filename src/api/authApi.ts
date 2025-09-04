import axios from "axios";
import { store } from "../store/store";
import { loginSucess, logout } from "../features/authSlice";

const getAccessToken = () => {
    return store.getState().auth.accessToken;
}

export const api = axios.create({
    baseURL : "http://localhost:8081", 
    withCredentials: true 
})

// 인터셉터
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
                const response = await axios.post(`http://localhost:8081/auth/refresh`,{},{
                    withCredentials:true
                });                
                // 응답성공시 accessToken을 다시 메모리에 저장
                store.dispatch(loginSucess(response.data))
                // 기존 요청 재시도 
                return api(originalRequest);
            }catch(refreshError){
                // 토큰 갱신 실패시 처리코드
                store.dispatch(logout());
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(err);
    } 
)