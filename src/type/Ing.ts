export interface IngItem {
    ingNo: number;
    ingName: string;
    ingCode: number;
    ingCodeName: string;
    nutrientNo: number;
}
export const initialIngItem = {
    ingNo: 0,
    ingName: '',
    ingCode: 0,
    ingCodeName: '',
    nutrientNo: 0
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
    expDate: new Date,
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
    expDate: new Date,
    quantity: ''
};
export const initialUpdateMyIng = initialNewMyIng;
