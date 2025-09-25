import { lodingImg } from "../../assets/images";
import type { MyIngItem } from "../../type/Ing";
import myingStyle from "./MyIng.module.css";
import MyIngDetailStyle from "./MyIngDetail.module.css"

// D-day 계산
export const today = new Date();
export const newDate = (DateStr:Date) => {
    return new Date(DateStr);
}

export function formatDate(DateStr:Date | undefined) {
    if(!DateStr) return;

    const date = new Date(DateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작
    const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export const calculateDDay = (expDateStr:Date) => {
    
    const diffTime = Number(newDate(expDateStr)) - Number(today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const label = diffDays >= 0 ? `D - ${diffDays}` : `D + ${Math.abs(diffDays)}`;
    return { label, days: diffDays };
};

export const expDateIcon = (item:MyIngItem) => {
    if(item.expDate){
        const {  label, days } = calculateDDay(item.expDate);
        return (
            <>
                {(days <= 3) && (
                    <img className={myingStyle[`bang-icon`]} src={lodingImg.bang} alt="!" />
                )}
                <div className={myingStyle[`d-day`]}>
                    {label}
                </div>
            </>
        );
    }
}

export const expDateMessage = (item:MyIngItem) => {
    if(item.expDate){
        const {days} = calculateDDay(item.expDate);
        return (
            <>
                {(days <= 3) && (
                    <div className={MyIngDetailStyle[`d-day-alert`]}>소비기한이 임박했습니다!</div>
                )}
            </>
        );
    }
}

export async function openIngPopup (target?:string) {

    const popup = window.open(
        `/ing-popup?target=${target}`,
        'IngPopup',
        'width=602px,height=502px,resizable=no,scrollbars=no'
    );
    
    if (!popup) {
        alert('팝업이 차단되었습니다. 브라우저 설정을 확인해주세요.');
        return;
    }
};