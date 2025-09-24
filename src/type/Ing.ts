import type { PageInfo } from "../api/adminApi";

export interface IngItem {
    ingNo: number;
    ingName: string;
    ingCode: number;
    ingCodeName: string;
    nutrientNo: number;
}
export interface PagedIngItem {
    list: IngItem[],
    pageInfo: PageInfo
}
export const initialIngItem = {
    ingNo: 0,
    ingName: '',
    ingCode: 0,
    ingCodeName: '',
    nutrientNo: 0
}

export interface IngCode {
    ingCode: number;
    ingCodeName: string;
}

export interface PagedIngListResponse {
    ingList: {ingNo: number; ingName: string;}[],
    pageInfo: PageInfo
}

export interface IngPair {
    pairNo: number;
    pairName: string;
    pairState: string;
}


export interface IngPedia {
    ingDetail: {
        ingNo: number;
        ingName: string;
        ingCode: number;
        ingCodeName: string;

        nutrientNo: number;
        energy?: number;
        carb?: number;
        protein?: number;
        fat?: number;
        sodium?: number;

        buyingTip?: string;
        usageTip?: string;
        storageMethod?: string;
        preparation?: string;
    };
    pairList?: IngPair[];
}
export type IngPediaUpdate = IngPedia;
export const initialUpdateIngPedia = {
    ingDetail: {
        ingNo: 0,
        ingName: '',
        ingCode: 0,
        ingCodeName: '',
        nutrientNo: 0,
    }
}

export interface IngCreate {
    ingDetail: {
        userNo?: number;
        ingNo?: number;
        ingName: string;
        ingCode: number;
        ingCodeName?: string;

        energy?: number;
        carb?: number;
        protein?: number;
        fat?: number;
        sodium?: number;

        buyingTip?: string;
        usageTip?: string;
        storageMethod?: string;
        preparation?: string;
    };
    pairList?: IngPair[];
}
export const initialIng = {
        ingDetail: {
        ingName: '',
        ingCode: 0,
        }
}





export interface MyIngItem {
    userNo: number;
    ingNo: number;
    createdAt?: Date;
    expDate?: Date;
    quantity: string;
    ingName: string;
    ingCode: number;
    ingCodeName: string;
}
export interface NewMyIng {
    userNo: number;
    ingNo: number;
    createdAt?: Date;
    expDate?: Date;
    quantity: string;
}
export const initialState = {
    userNo: 0,
    ingNo: 0,
    createdAt: new Date,
    quantity: '',
    ingName: '',
    ingCode: 0,
    ingCodeName: '분류'
}

export interface GroupedData {
    [key: string]: MyIngItem[];
}

// 메뉴 등록 타입
export type MyIngCreate = MyIngItem;
// 메뉴 수정 타입
export type MyIngUpdate = NewMyIng;
export const initialNewMyIng = {
    userNo: 0,
    ingNo: 0,
    createdAt: new Date,
    quantity: ''
};
export const initialUpdateMyIng = initialNewMyIng;
