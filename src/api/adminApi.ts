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
    await api.patch(`/challenges/resolve/${formNo}`);
};

export const fetchRecipes = async (page: number, size: number) => {
    const response = await api.get('/recipes',{params: {page, size}});
    return response.data;
}

export const resolveRecipes = async (recipe: Recipe) => {
    await api.patch(`/recipes/resolve/${recipe.type.toLowerCase()}/${recipe.rcpNo}`);
};

export const fetchUserReports = async (page: number, size: number) => {
    const response = await api.get('/reports/user',{params: {page, size}});
    return response.data;
}

export const fetchCommReports = async (page: number, size: number) => {
    const response = await api.get('/reports/comm',{params: {page, size}});
    return response.data;
}

export const resolveReport = async (report: Reports) => {
    // 백엔드에서 cooking_class일 경우에는 추가적으로 채팅방 퇴장
    await api.patch(`/reports/resolve`,{report});
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