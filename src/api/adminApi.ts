import axios from "axios";
import { store } from "../store/store";
import type { Announcement } from "../components/Admin/newAnnouncement";
import { loginSuccess, logout, saveUserData } from "../features/authSlice";

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

api.interceptors.response.use(
    (response) => response,
    async (err) => {
        const originalRequest = err.config;
        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const response = await axios.post(
                    "http://localhost:8081/auth/tokens/refresh",
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

export const fetchChallenges = async (page: number, size: number) => {
    const response = await api.get('/challenges', { params: { page, size } });
    return response.data;
};

export const resolveChallenge = async (formNo: number) => {
    await api.patch(`/challenges/${formNo}`);
};

export const fetchRecipes = async (page: number, size: number) => {
    const response = await api.get('/recipes', { params: { page, size } });
    return response.data;
}

export const disproveRecipe = async (rcpNo: number) => {
    await api.patch(`/recipes/disprove/${rcpNo}`);
}

export const approveRecipe = async (rcpNo: number) => {
    await api.patch(`/recipes/approve/${rcpNo}`);
}

export const fetchUserReports = async (page: number, size: number) => {
    const response = await api.get('/reports/user', { params: { page, size } });
    return response.data;
}

export const fetchCommReports = async (page: number, size: number) => {
    const response = await api.get('/reports/comm', { params: { page, size } });
    return response.data;
}

export const resolveReport = async (reportNo: number) => {
    await api.patch(`/reports/${reportNo}`);
};

export const getChatRoom = async (userNo: number) => {
    const response = await api.get(`/chatRooms/${userNo}`);
    return response.data;
};

export const banUser = async (userNo: number, banDur: string) => {
    await api.post(`/users/${userNo}/${banDur}`);
};

export const newChallenge = async function (challenge: FormData) {
    await api.post(`/challenges`, challenge, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const newAnnouncement = async function (announcement: Announcement) {
    await api.post(`/announcements`, announcement);
};

export const getUsers = async (page: number, size: number) => {
    const response = await api.get(`/users`, { params: { page, size } });
    return response.data;
};

export const getRecipes = async (page: number, size: number) => {
    const response = await api.get(`/all-recipes`, { params: { page, size } });
    return response.data;
};

export const getCommunityData = async (page: number, size: number) => {
    const response = await api.get(`/communities`, { params: { page, size } });
    return response.data;
};

export const getClassData = async (page: number, size: number) => {
    const response = await api.get(`/classes`, { params: { page, size } });
    return response.data;
};

export const getClassInfo = async (roomNo: number) => {
    const response = await api.get(`/classes/${roomNo}`);
    return response.data;
};

export const getCustomerServices = async (page: number, size: number) => {
    const response = await api.get(`/cservices`, { params: { page, size } });
    return response.data;
};

export const getCSinfo = async (roomNo: number) => {
    const response = await api.get(`/cservices/${roomNo}`);
    return response.data;
};

export const getAnnouncements = async (page: number, size: number) => {
    const response = await api.get(`/announcements`, { params: { page, size } });
    return response.data;
};

export const deleteAnnouncement = async (ancmtNo: number) => {
    await api.delete(`/announcements/${ancmtNo}`);
};

export const editAnnouncement = async (annoucement: Announcement) => {
    await api.patch(`/announcements`, annoucement);
};

export const getChallengeInfos = async (page: number, size: number) => {
    const response = await api.get(`/challenges/info`, { params: { page, size } });
    return response.data;
};

export const editChallenge = async (challenge: FormData) => {
    await api.put(`/challenges`, challenge, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const deleteChallenge = async (chInfoNo: number) => {
    await api.delete(`/challenges/${chInfoNo}`);
};

export const getIngredients = async (page: number, size: number) => {
    const response = await api.get(`/ingredients`, { params: { page, size } });
    return response.data;
};

export const getParentRep = async (reportNo: number) => {
    const response = await api.get(`/reports/${reportNo}`);
    return response.data;
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