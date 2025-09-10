import axios from "axios";
import { store } from "../store/store";

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
    foodNo: number;
    foodName: string;
    energy: number;
    carb: number;
    protein: number;
    fat: number;
    sodium: number;
}

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

export async function saveMealItem(userNo: number | undefined, mealId: string, date: string, item: MealItemData, weight: number) {
    const response = await mealplanApi.post(`/newMeal/${userNo}`, {
        mealDate: date,
        mealId,
        mealType: "FOOD",
        refNo: item.foodNo,
        quantity: weight
    });
    return response.data;
}