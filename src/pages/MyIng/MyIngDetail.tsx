import { Link, useNavigate, useParams } from "react-router-dom";
import { lodingImg } from "../../assets/images";
import MyIngDetailStyle from "./MyIngDetail.module.css"
import "../../assets/button.css"
import cx from "classnames";
import { useEffect, type FormEvent } from "react";
import { initialUpdateMyIng, type MyIngItem, type MyIngUpdate } from "../../type/myIng";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMyIng, getMyIng, updateMyIng } from "../../api/myIngApi";
import { expDateIcon, expDateMessage, formatDate } from "./common";
import useInput from "../../hooks/useInput";
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

export default function MyIngDetail(){

    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const userNo = useSelector((state: RootState) => state.auth.user?.userNo);

    const navigate = useNavigate();
    const {ingNo} = useParams();
    
    const {data: MyIngItem, isLoading, isError, error} = useQuery<MyIngItem>({
        queryKey: ['MyIngItem', ingNo], // 캐시 구분용 키
        queryFn: () => getMyIng(Number(ingNo), userNo ?? 0),
        staleTime: 1000*60, // Fresh 유지 시간
        gcTime: 1000 *60 * 5, // 캐시 메모리 저장 시간
        enabled: true
    });
    
    const [newMyIng, handleInputChange, resetMyIng, setNewMyIng] = useInput<MyIngUpdate>(initialUpdateMyIng);
    
    useEffect(()=>{
        if (MyIngItem) {
        const { userNo, ingNo, createdAt, expDate, quantity } = MyIngItem;
        setNewMyIng({ userNo, ingNo, createdAt: createdAt ? new Date(createdAt) : undefined,
            expDate: expDate ? new Date(expDate) : undefined, quantity });
    }
    },[MyIngItem]);

    const queryClient = useQueryClient();
    const mutation = useMutation({
            mutationFn: (newMyIng:MyIngUpdate) => updateMyIng(Number(ingNo), userNo ?? 0, newMyIng),
            onSuccess: (res) => {
                // 등록 요청 성공 시
                queryClient.invalidateQueries({queryKey:['MyIngItem', ingNo]}); // 메뉴 목록 데이터 캐시 무효화
                queryClient.invalidateQueries({queryKey:['MyIngs']}); // 메뉴 목록 데이터 캐시 무효화
                navigate(`/mypage/inglist/detail/${ingNo}`, {
                    state: {flash: "식재료 정보가 수정되었습니다."}
                });
            }
    })

    if(mutation.isPending){
        return <div>Loading...</div>
    }

    if(mutation.isError){
        console.log(newMyIng);
        return <div className="alert alert-danger">{mutation.error.message}</div>
    }

    const editMyIng = (e: FormEvent) => {
        e.preventDefault(); // 제출 방지
        const payload = {
            ...newMyIng,
            createdAt: new Date(newMyIng.createdAt ?? ''),
            expDate: new Date(newMyIng.expDate ?? '')
        }
        mutation.mutate(payload); //비동기함수 실행
    }

    const deleteMyIngMutation = useMutation({
        mutationFn: (ingNo:number) => deleteMyIng(ingNo, userNo ?? 0),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:['MyIngItem', ingNo]});
        }
    })
    const handleDelete = (ingNo:number) => {
        deleteMyIngMutation.mutate(ingNo);
    };

    if(isLoading) return <div>Loading...</div>
    if(isError) return <div style={{color:'red'}}>{error.message}</div>
    if(!MyIngItem) return <div>값 없음</div>
    


    return (
        <>
            <div className={MyIngDetailStyle.container}>
                <section className={MyIngDetailStyle["ing-detail"]}>
                    <div className={MyIngDetailStyle[`title-area`]}>
                        <div className="flex-row gap-10">
                            <h2>내 식재료 관리</h2>
                            <h2>&gt;</h2>
                            <h2>상세보기</h2>
                        </div>
                    </div>
                    <div className={MyIngDetailStyle[`title-area`]}>
                        <h3>{MyIngItem.ingCodeName}</h3>
                        <hr className={MyIngDetailStyle["gray"]}/>
                    </div>
                    <div className={cx(MyIngDetailStyle["content-area"], MyIngDetailStyle["ing-detail-section"])}>
                        
                        <div className={MyIngDetailStyle["thumb-area"]}>
                            <div className={MyIngDetailStyle["thumbnail"]}>
                                <img src={lodingImg.noImage} className={MyIngDetailStyle["thumbnail-img"]}/>
                                {expDateIcon(MyIngItem)}
                            </div>
                            {expDateMessage(MyIngItem)}
                        </div>
                        <form className={MyIngDetailStyle["ing-inform"]} id="myIngForm" onSubmit={editMyIng}>
                            <select name="ingCodeName" className={MyIngDetailStyle["drop-menu"]} disabled>
                                <option value={MyIngItem.ingCode} className={MyIngDetailStyle["drop-item"]}>{MyIngItem.ingCodeName}</option>
                            </select>
                            <input type="text" value={MyIngItem.ingName} className={MyIngDetailStyle["ing-name"]} disabled/>
                            <div className={MyIngDetailStyle["sub-inform"]}>
                                <h3>수량 / 무게</h3><input type="text" value={newMyIng.quantity ?? ''} className={MyIngDetailStyle["ing-quantity"]} name="quantity" onChange={handleInputChange}/>
                                <h3>등록일</h3>
                                <input type="date" value={formatDate(newMyIng.createdAt ?? new Date)} className={MyIngDetailStyle["ing-regidate"]} name="regidate" onChange={(e) => setNewMyIng((prev) => ({...prev, createdAt: new Date(e.target.value), }))}/>
                                <h3>소비기한</h3>
                                <input type="date" value={formatDate(newMyIng.expDate ?? new Date)} className={MyIngDetailStyle["ing-usedate"]} name="usedate" onChange={(e) => setNewMyIng((prev) => ({...prev, expDate: new Date(e.target.value), }))}/>
                            </div>
                        </form>
                    </div>
                    <section className={MyIngDetailStyle["btn-group"]}>
                        <div className={cx("flex-row", "gap-20", "center")}>
                            <button type="submit" className={cx("click-basic", "semi-round-btn", "olive")} disabled={mutation.isPending} onClick={editMyIng}>수정</button>
                            <button className={cx("click-basic", "semi-round-btn", "red")}
                            onClick={
                                (e) => {
                                    e.stopPropagation();
                                    handleDelete(MyIngItem.ingNo);
                                }}>삭제</button>
                        </div>
                    </section>
                </section>
                <hr/>

                {/* <!-- 관련 레시피 --> */}
                <section className={cx(MyIngDetailStyle["recipe-section"])}>
                    <div className={MyIngDetailStyle[`title-area`]}>
                        <h3>관련 레시피</h3>
                        <hr className={MyIngDetailStyle["gray"]}/>
                        <a href="#" className={MyIngDetailStyle[`more-link`]}>더보기</a>
                    </div>


                    <div className={cx(MyIngDetailStyle["content-area"])}>

                        <article className={MyIngDetailStyle["recipe-item"]}>
                            <div className={MyIngDetailStyle["thumbnail"]}>
                                <img src={lodingImg.noImage} className={MyIngDetailStyle["thumbnail-img"]}/>
                            </div>
                            <div className={MyIngDetailStyle["recipe-inform"]}>
                                <h3>레시피 제목이 들어가는 영역(줄바꿈 ...처리)ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ</h3>
                                <div>조리시간: 60분 이내</div>
                                <div>재료: 재료1, 재료2, 재료3....</div>
                            </div>
                        </article><article className={MyIngDetailStyle["recipe-item"]}>
                            <div className={MyIngDetailStyle["thumbnail"]}>
                                <img src={lodingImg.noImage} className={MyIngDetailStyle["thumbnail-img"]}/>
                            </div>
                            <div className={MyIngDetailStyle["recipe-inform"]}>
                                <h3>레시피 제목이 들어가는 영역(줄바꿈 ...처리)ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ</h3>
                                <div>조리시간: 60분 이내</div>
                                <div>재료: 재료1, 재료2, 재료3....</div>
                            </div>
                        </article>

                    </div>
                </section>
                

            </div>
        </>
    )
}