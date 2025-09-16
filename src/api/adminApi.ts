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

export const fetchChallenges = async (page: number, size: number) => {
    const response = await api.get('/challenges',{params: {page, size}});
    return response.data;
};

export const resolveChallenge = async (formNo: number) => {
    await api.patch(`/challenges/${formNo}`);
};

export const fetchRecipes = async (page: number, size: number) => {
    const response = await api.get('/recipes',{params: {page, size}});
    return response.data;
}

export const disproveRecipe = async (rcpNo: number) => {
    await api.patch(`/recipes/disprove/${rcpNo}`);
}

export const approveRecipe = async (rcpNo: number) => {
    await api.patch(`/recipes/approve/${rcpNo}`);
}

export const fetchUserReports = async (page: number, size: number) => {
    const response = await api.get('/reports/user',{params: {page, size}});
    return response.data;
}

export const fetchCommReports = async (page: number, size: number) => {
    const response = await api.get('/reports/comm',{params: {page, size}});
    return response.data;
}

export const resolveReport = async (reportNo: number) => {
    await api.patch(`/reports/${reportNo}`);
};


export type PageInfo = {
    listCount: number;
    currentPage: number;
    pageLimit: number;
    itemLimit: number;
    maxPage: number;
    startPage: number;
    endPage: number;
};

export type Reports = {
    reportNo: number;
    userNo: number;
    category: string;
    detail: string;
    refNo: number;
    content: string;
    reportedAt: string;
}

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

export type ChallengeForm = {
    formNo: number;
    userNo: number;
    chTitle: string;
    description: string;
    reference: string;
    createdAt: string;
}