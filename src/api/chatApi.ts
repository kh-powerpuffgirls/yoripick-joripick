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
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async () => {}
)

export const getRooms = async function (userNo: number | undefined) {
    const response = await api.get(`/rooms/${userNo}`);
    return response.data;
}

export const deleteRooms = async function (type: "admin" | "cclass" | "cservice" | null, user: User) {
    await api.delete(`/rooms/${type}/${user.userNo}`);
}

export const saveMessage = async function (userNo: number | undefined, content: string, role: "USER" | "BOT") {
    await api.post(`/messages/${userNo}`, {
        content,
        role
    });
};