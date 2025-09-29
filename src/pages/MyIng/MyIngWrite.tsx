import { Link, useNavigate } from "react-router-dom";
import { lodingImg } from "../../assets/images";
import "../../assets/css/button.css";
import ingDefaultStyle from "../../assets/css/ingDefault.module.css";
import MyIngWriteStyle from "./MyIngWrite.module.css"
import cx from "classnames";
import { useSelector } from "react-redux";
import type { RootState } from '../../store/store';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { initialState, type MyIngCreate, type MyIngItem } from "../../type/Ing";
import { insertMyIng as createMyIng } from "../../api/ing/myIngApi";
import useInput from "../../hooks/useInput";
import { useEffect, useState, type FormEvent } from "react";
import { formatDate, openIngPopup } from "./common";

export default function MyIngWrite(){
    const userNo = useSelector((state: RootState) => state.auth.user?.userNo);
    const navigate = useNavigate();
    const [newMyIng, setNewMyIng] = useState<MyIngCreate>(initialState);
    const queryClient = useQueryClient();

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'ING_RESULT') {
            const { ingNo, ingName, ingCode, ingCodeName, imgUrl } = event.data.payload;

            setNewMyIng((prev) => ({
                ...prev,
                ingNo,
                ingName,
                ingCode,
                ingCodeName,
                imgUrl,
            }));
            }
        };

        setNewMyIng((prev) => ({...prev,userNo:userNo as number}));

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [userNo]);

    useEffect(() => {
        console.log(newMyIng);
    }, [newMyIng]);

    const mutation = useMutation({
            mutationFn: (newMyIng:MyIngCreate) => createMyIng(newMyIng),
            onSuccess: (res) => {
                // 등록 요청 성공 시
                queryClient.invalidateQueries({queryKey:['MyIngs']}); // 메뉴 목록 데이터 캐시 무효화
                navigate('/mypage/inglist', {
                    state: {flash: "식재료가 등록되었습니다."}
                });
            }
    })

    if(mutation.isPending){
        return <div>Loading...</div>
    }

    if(mutation.isError){
        return <div className="alert alert-danger">{mutation.error.message}</div>
    }

    const insertMyIng = (e: FormEvent) => {
        e.preventDefault(); // 제출 방지
        if(newMyIng.ingNo == null || newMyIng.ingNo == 0 ){
            alert('식재료를 선택하세요');
            return;
        }
        if(newMyIng.quantity == null || newMyIng.quantity == ''){
            alert('수량을 입력하세요');
            return;
        }
        mutation.mutate(newMyIng); //비동기함수 실행
    }

    

    return (
        <>
            <div className={cx(ingDefaultStyle["ing-default"], ingDefaultStyle["container"], MyIngWriteStyle["mying-write"])}>
                <section className={MyIngWriteStyle["ing-detail"]}>
                    <div className={ingDefaultStyle[`title-area`]}>
                        <div className="flex-row gap-10">
                            <h2>내 식재료 관리</h2>
                            <h2>＞</h2>
                            <h2>등록하기</h2>
                        </div>
                    </div>
                    <div className={ingDefaultStyle[`title-area`]}>
                        <h3>새 재료</h3>
                        <hr className={MyIngWriteStyle["gray"]}/>
                    </div>
                    <div className={cx(ingDefaultStyle["content-area"], MyIngWriteStyle["ing-detail-section"])}>
                        
                        <div className={MyIngWriteStyle["thumbnail"]}>
                            <img src={newMyIng.imgUrl ?? lodingImg.noImage} className={MyIngWriteStyle["thumbnail-img"]}/>
                        </div>
                        <section className={MyIngWriteStyle["ing-inform"]}>
                            <select name="ingCodeName" className={MyIngWriteStyle["drop-menu"]} onClick={()=>openIngPopup()}>
                                <option value={newMyIng.ingCode} className={MyIngWriteStyle["drop-item"]}>{newMyIng.ingCodeName}</option>
                            </select>
                            <input type="text" name="ingName" className={MyIngWriteStyle["ing-name"]} placeholder="재료명"
                            onChange={()=>setNewMyIng}  onClick={()=>openIngPopup()} value={newMyIng.ingName}/>
                            <div className={MyIngWriteStyle["sub-inform"]}>
                                <h3>수량 / 무게<span className={MyIngWriteStyle["point"]}> *</span></h3><input type="text" className={MyIngWriteStyle["ing-quantity"]} name="quantity" placeholder="ex) 100g / 1개" value={newMyIng.quantity} onChange={(e) => setNewMyIng(prev => ({ ...prev, quantity: e.target.value }))}/>
                                <h3>등록일</h3>
                                <input type="date" value={formatDate(newMyIng.createdAt ?? new Date)} className={MyIngWriteStyle["ing-regidate"]} name="createdAt" onChange={(e)=>setNewMyIng({...newMyIng, createdAt: new Date(e.target.value)})}/>
                                <h3>소비기한</h3>
                                <input type="date" value={formatDate(newMyIng.expDate) ?? ""} className={MyIngWriteStyle["ing-usedate"]} name="expDate" onChange={(e)=>setNewMyIng({...newMyIng, expDate: new Date(e.target.value)})}/>
                            </div>
                        </section>
                    </div>
                    <section className={MyIngWriteStyle["btn-group"]}>
                        <div className={cx("flex-row", "gap-20", "center")}>
                            <button className={cx("click-basic", "semi-round-btn", "olive")} onClick={insertMyIng}>등록</button>
                            <button className={cx("click-basic", "semi-round-btn", "red")} onClick={() => navigate(`/mypage/inglist`)}>취소</button>
                        </div>
                    </section>
                </section>
                <hr/>

            </div>
        </>
    )
}