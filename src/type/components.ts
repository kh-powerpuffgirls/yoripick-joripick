import type { ReactNode } from "react";

export interface AlertState {
    htmlComponent: ReactNode;
    visible: boolean;
}

export const initialState: AlertState = {
    htmlComponent: null,
    visible: false,
};