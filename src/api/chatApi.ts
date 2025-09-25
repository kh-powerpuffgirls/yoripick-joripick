import axios from "axios";
import { store } from "../store/store";
import type { User } from "../type/authtype";
import type { ChatRoomCreate, Message } from "../type/chatmodal";

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
    async (error) => {
        console.log(error);
        return Promise.reject(error);
    }
)

export const lastRead = async function (userNo: number, roomNo: string|number, messageNo: number) {
    await api.patch(`/reads`, null, { params: {userNo, roomNo, messageNo} });
}

export const getLastRead = async function (userNo: number, roomNo: string|number) {
    const response = await api.get(`/reads/${userNo}/${roomNo}`);
    return response.data;
}

export const getRooms = async function (userNo: number | undefined) {
    const response = await api.get(`/rooms/${userNo}`);
    return response.data;
}

export const deleteRooms = async function (type: ChatRoomCreate, user: User) {
    const response = await api.delete(`/rooms/${type}/${user.userNo}`);
    return response.data;
}

export const saveMessage = async function (type: ChatRoomCreate | undefined,
        roomNo: string | number | undefined, message: FormData): Promise<Message> {
    const response = await api.post<Message>(`/messages/${type}/${roomNo}`, message, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
}

export const getAdminSubs = async function (userNo: number | undefined) {
    const response = await api.get(`/admin/${userNo}`);
    return response.data;
}