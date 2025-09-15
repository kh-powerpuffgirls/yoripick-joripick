import axios from "axios";
import { store } from "../store/store";
import type { User } from "../type/authtype";
import { type IngItem, type MyIngCreate, type MyIngItem, type MyIngUpdate } from "../type/Ing";

const getAccessToken = () => {
    return store.getState().auth.accessToken;
};

const api = axios.create({
    baseURL: `http://localhost:8081/api/inglist`,
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

export const getMyIngs = async function (userNo: number | undefined) {
    const response = await api.get(`/${userNo}`);
    return response.data;
}

export const insertMyIng = async function (newMyIng:MyIngCreate) {
    const response = await api.post(`/write`, newMyIng);
    return response.data;
}

export const getMyIng = async function (ingNo: number, userNo:number) {
    const response = await api.get(`/detail/${ingNo}/${userNo}`);
    console.log(ingNo);
    return response.data;
}

export const deleteMyIng = async function (ingNo: number, userNo:number) {
    const response = await api.delete(`/detail/${ingNo}/${userNo}`);
    return response.data;
}

export const updateMyIng = async function (ingNo:number, userNo:number, newMyIng:MyIngUpdate) {
    const response = await api.put(`/detail/${ingNo}/${userNo}`, newMyIng);
    return response.data;
}

export const searchMyIngs = async function (submittedKeyword: string, userNo:number) {
    const response = await api.get<MyIngItem[]>(`/${userNo}`);
    return response.data;
}