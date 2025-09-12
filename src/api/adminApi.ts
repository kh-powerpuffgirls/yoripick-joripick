import axios from "axios";
import { store } from "../store/store";

const getAccessToken = () => {
    return store.getState().auth.accessToken;
}

export const api = axios.create({
    baseURL: "http://localhost:8081/admin",
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

export type ChallengeForm = {
    formNo: number;
    userNo: number;
    chTitle: string;
    description: string;
    reference: string;
    createdAt: string;
}

export const fetchChallenges = async () => {
    const response = await api.get<ChallengeForm[]>('/challenges');
    return response.data;
};

export const resolveChallenge = async (formNo: number) => {
    await api.patch(`/challenges/resolve/${formNo}`);
};

export type Recipe = {
    rcpNo: number;
    userNo: number;
    title: string;
    info: string;
    type: string;
    reportNo: number;
    detail: string;
    content: string;
    reportedAt: string;
}

export type PageInfo = {
    listCount: number;
    currentPage: number;
    pageLimit: number;
    itemLimit: number;
    maxPage: number;
    startPage: number;
    endPage: number;
};

export const fetchRecipes = async (page: number, size: number) => {
    const response = await api.get('/recipes',{params: {page, size}});
    return response.data;
}

export type Reports = {
    reportNo: number;
    userNo: number;
    category: string;
    detail: string;
    refNo: number;
    content: string;
    reportedAt: string;
}

export const fetchReports = async () => {
    const response = await api.get<Reports[]>('/reports');
    return response.data;
}