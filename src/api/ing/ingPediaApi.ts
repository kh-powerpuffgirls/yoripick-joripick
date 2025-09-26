import axios from "axios";
import { type IngCreate, type IngPedia, type IngPediaMain, type IngPediaUpdate, type PagedIngListResponse } from "../../type/Ing";

const api = axios.create({
    baseURL: `http://localhost:8081/ingpedia`,
    withCredentials: true
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log(error);
        return Promise.reject(error);
    }
)

export const createIngPedia = async function (newIng:IngCreate) {
    const response = await api.post(``, newIng);
    return response.data;
}

export const getIngPedia = async function (ingNo: number) {
    const response = await api.get<IngPedia>(`/detail/${ingNo}`);
    return response.data;
}

export const getIngPediaMain = async function () {
    const response = await api.get<IngPediaMain[]>(`/main`);
    return response.data;
}

export const deleteIngPedia = async function (ingNo: number) {
    const response = await api.delete(`/detail/${ingNo}`);
    return response.data;
}

export const updateIngPedia = async function (ingNo: number, newIngPedia:IngPediaUpdate) {
    const response = await api.put(`/detail/${ingNo}`, newIngPedia);
    return response.data;
}

export const searchIngPedia = async function(searchKeyword:{ingCode?:number, keyword?: string, page?:number}){
    const response = await api.get<PagedIngListResponse>("", {
        params: {
            ingCode: searchKeyword.ingCode,
            keyword: searchKeyword.keyword,
            page: searchKeyword.page
        }
    });
    return response.data;
}