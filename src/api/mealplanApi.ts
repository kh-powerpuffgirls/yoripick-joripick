import axios from "axios";
import { store } from "../store/store";
import type { NutrientData } from "../components/Mealplan/mealplanNut";
import { loginSuccess, logout, saveUserData } from "../features/authSlice";

const getAccessToken = () => {
    return store.getState().auth.accessToken;
};

export const mealplanApi = axios.create({
    baseURL: "https://api.ypjp.store/mealplan",
    withCredentials: true
});

mealplanApi.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

mealplanApi.interceptors.response.use(
    (response) => response,
    async (err) => {
        const originalRequest = err.config;
        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const response = await axios.post(
                    "https://api.ypjp.store/auth/tokens/refresh",
                    {},
                    { withCredentials: true }
                );
                store.dispatch(saveUserData(response.data));
                store.dispatch(loginSuccess());
                const newToken = response.data.accessToken;
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return mealplanApi(originalRequest);
            } catch (refreshError) {
                store.dispatch(logout());
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(err);
    }
)

export interface MealItemData {
    mealNo: number;
    mealType: "FOOD" | "RCP";
    foodNo: number;
    foodName: string;
    energy: number;
    carb: number;
    protein: number;
    fat: number;
    sodium: number;
    quantity: number;
}

export type NewFoodItem = Omit<MealItemData, 'mealNo' | 'foodNo'>

export const searchFoods = async function (searchKeyword: { query: string, foodCode: number | null }) {
    const response = await mealplanApi.get<MealItemData[]>("/foods", {
        params: {
            query: searchKeyword.query,
            foodCode: searchKeyword.foodCode
        }
    });
    return response.data;
};

export interface FoodCodeData {
    foodCode: number;
    foodCodeName: string;
}

export const fetchFoodCodes = async function () {
    const response = await mealplanApi.get<FoodCodeData[]>("/foodCodes");
    return response.data;
};

export async function saveMealItem(userNo: number | undefined, mealId: string, date: string, item: MealItemData) {
    const response = await mealplanApi.post(`/meals/${userNo}`, {
        mealDate: date,
        mealId,
        mealType: item.mealType,
        refNo: item.foodNo,
        quantity: item.quantity
    });
    return response.data;
}

export const fetchMealList = async (userNo: number | undefined, date: string) => {
    const response = await mealplanApi.get<Record<string, MealItemData[]>>(`/meals/${userNo}`, {
        params: {
            date
        }
    });
    return response.data;
};

export const fetchMealStats = async (fromDate: string, toDate: string, userNo: number | undefined) => {
    const res = await mealplanApi.get<Record<string, NutrientData>>(`/stats/${userNo}`, {
        params: { from: fromDate, to: toDate, userNo },
    });
    return res.data;
};

export const removeMealItem = async (mealNo: number) => {
    await mealplanApi.delete(`/meals/${mealNo}`);
};

export const fetchRecent = async (userNo: number | undefined) => {
    const response = await mealplanApi.get<MealItemData[]>(`/recents/${userNo}`);
    return response.data;
};

export async function saveFoodItem(userNo: number | undefined, mealId: string, date: string, item: NewFoodItem) {
    const response = await mealplanApi.post(`/foods/${userNo}`, {
        mealDate: date,
        mealId,
        mealType: "FOOD",
        item
    });
    return response.data;
}

export async function fetchRecipes(userNo: number) {
    const response = await mealplanApi.get(`recipes/${userNo}`);
    return response.data;
}

export async function addRcpItem(userNo: number | undefined, mealId: string, date: string, rcpNo: number) {
    const response = await mealplanApi.post(`meals/${userNo}`, {
        mealDate: date,
        mealId,
        mealType: "RCP",
        refNo: rcpNo
    });
    return response.data;
}