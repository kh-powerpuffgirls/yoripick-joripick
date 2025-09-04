import axios from "axios";
import type { Message } from "../type/chatmodal";

const api = axios.create({
    baseURL: "http://localhost:8081/chat",
    withCredentials: true
});

api.interceptors.response.use (
    response => response,
    async (err) => {
        
        return Promise.reject(err);
    }
)

export const saveMessage = async function (message:Message, roomId:string|number, msgType:string) {
    const response = await api.post(`/messages/${msgType}/${roomId}`, {
        params: {
            message
        }
    });
    return response;
};