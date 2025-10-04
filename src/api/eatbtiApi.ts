import axios from "axios";
import { store } from "../store/store";
import { loginSuccess, logout, saveUserData } from "../features/authSlice";

const getAccessToken = () => {
    return store.getState().auth.accessToken;
}

export const api = axios.create({
    baseURL: "http://3.38.213.177:8081/eatbti",
    withCredentials: true
})


api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
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
        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const response = await axios.post(
                    "http://3.38.213.177:8081/auth/tokens/refresh",
                    {},
                    { withCredentials: true }
                );
                store.dispatch(saveUserData(response.data));
                store.dispatch(loginSuccess());
                const newToken = response.data.accessToken;
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                store.dispatch(logout());
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(err);
    }
)

export const saveEatBTI = async (userNo: number, sikBti: string) => {
    await api.patch(`/${userNo}`, null, { params: { sikBti } });
};