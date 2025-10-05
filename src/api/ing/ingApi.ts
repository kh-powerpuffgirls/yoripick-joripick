import axios from "axios";
import { store } from "../../store/store";
import { type IngCode, type PagedIngItem } from "../../type/Ing";

const getAccessToken = () => {
    return store.getState().auth.accessToken;
};

const api = axios.create({
    baseURL: `https://api.ypjp.store:8443/ingdata`,
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

export const getIngCodes = async function () {
    const response = await api.get<IngCode[]>("/codes");
    return response.data;
}

export const searchIngs = async function(searchKeyword:{ingCode?:number, keyword?: string, page?:number}){
    const response = await api.get<PagedIngItem>("", {
        params: {
            ingCode: searchKeyword.ingCode,
            keyword: searchKeyword.keyword,
            page: searchKeyword.page
        }
    });
    return response.data;
}