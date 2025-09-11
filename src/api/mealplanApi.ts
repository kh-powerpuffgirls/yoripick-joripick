import axios from "axios";
import { store } from "../store/store";
import type { NutrientData } from "../components/Mealplan/mealplanNut";

const getAccessToken = () => {
    return store.getState().auth.accessToken;
};

export const mealplanApi = axios.create({
    baseURL: "http://localhost:8081/mealplan",
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

export interface MealItemData {
    mealNo: number;
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
        mealType: "FOOD",
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
    console.log(mealNo);
    await mealplanApi.delete(`/meals/${mealNo}`);
};

export const fetchRecent = async (userNo: number | undefined) => {
    const response = await mealplanApi.get<MealItemData[]>(`/recents/${userNo}`);
    return response.data;
};

export async function saveFoodItem(userNo: number | undefined, mealId: string, date: string, item: NewFoodItem) {
    console.log("Saving item:", item);
    const response = await mealplanApi.post(`/foods/${userNo}`, {
        mealDate: date,
        mealId,
        mealType: "FOOD",
        item
    });
    return response.data;
}

export async function fetchRecipes(userNo: number) {
    const response = await axios.get(`recipes/${userNo}`);
    return response.data;
}