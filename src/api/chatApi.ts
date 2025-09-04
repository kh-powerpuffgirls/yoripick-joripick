import axios from "axios";
import { store } from "../store/store";
import type { User } from "../type/authtype";

const getAccessToken = () => {
    return store.getState().auth.accessToken;
};

const api = axios.create({
    baseURL: `http://localhost:8081/chat`,
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, 
    (error) => Promise.reject(error)
);

export const getRooms = async function() {
    const response = await api.get(`/rooms`);
    return response;
}

export const deleteRooms = async function (type: "admin" | "cclass" | "cservice" | null, user: User) {
    await api.delete(`/rooms/${type}/${user.userNo}`);
}

export const saveMessage = async function (content: string, role: "USER"|"BOT") {
    await api.post(`/messages`, {
        params: {
            content,
            role
        }
    });
};