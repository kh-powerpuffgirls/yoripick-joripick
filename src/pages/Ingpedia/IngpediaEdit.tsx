import { Link, useNavigate, useParams } from "react-router-dom";
import { lodingImg } from "../../assets/images";
import ingEditStyle from "./IngpediaEdit.module.css"
import "../../assets/css/button.css";
import ingDefaultStyle from "../../assets/css/ingDefault.module.css";
import cx from "classnames";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { initialIng, initialUpdateIngPedia, type IngCreate, type IngPair, type IngPedia, type IngPediaUpdate } from "../../type/Ing";
import { openIngPopup } from "../MyIng/common";
import { createIngPedia, getIngPedia, updateIngPedia } from "../../api/ing/ingPediaApi";
import useInput from "../../hooks/useInput";

export default function IngpediaEdit(){ 

    const userNo = useSelector((state: RootState) => state.auth.user?.userNo);
    const [newIngPedia, handleInputChange, resetIngPedia, setNewIngPedia] = useInput<IngPediaUpdate>(initialUpdateIngPedia);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { ingNo } = useParams();



    
    // 이미 등록한 식재료에 잉피디아 정보 추가
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type === 'ING_RESULT') {
                const { ingNo, ingName, ingCode, ingCodeName } = event.data.payload;
                const target = event.data.target;
                console.log(target);
                switch(target){
                    case "best":
                        setNewIngPedia({...newIngPedia, pairList: [...(newIngPedia.pairList ?? []), {pairNo: ingNo, pairName: ingName, pairState: 'B'},],});
                        break;
                    case "worst":
                        setNewIngPedia({...newIngPedia, pairList: [...(newIngPedia.pairList ?? []), {pairNo: ingNo, pairName: ingName, pairState: 'W'},],});
                        break;
                    default:
                }
            }
        };
        
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [newIngPedia]);

        const {data: ingPediaItem, isLoading, isError, error} = useQuery<IngPedia>({
        queryKey: ['ingPedia', ingNo], // 캐시 구분용 키
        queryFn: () => getIngPedia(Number(ingNo)),
        staleTime: 1000*60, // Fresh 유지 시간
        gcTime: 1000 *60 * 5, // 캐시 메모리 저장 시간
        enabled: !!userNo && userNo != 0
    });
    
    useEffect(()=>{
        if(ingPediaItem) setNewIngPedia(ingPediaItem);
    },[ingPediaItem]);
    
    if(isLoading) return <div>Loading...</div>
    if(isError) return <div style={{color:'red'}}>{error.message}</div>
    if(!ingPediaItem) return <div>값 없음</div>

    const insertIngPedia = (e: FormEvent) => {
        e.preventDefault(); // 제출 방지
        if(newIngPedia.ingDetail == null || newIngPedia.ingDetail.ingName == '' ){
            alert('재료명을 입력하세요');
            return;
        }
        if(newIngPedia.ingDetail.ingCodeName == null || newIngPedia.ingDetail.ingCodeName == '' ){
            alert('재료 분류를 선택하세요');
            return;
        }
        console.log("newIng:", newIngPedia);
        mutation.mutate(newIngPedia); //비동기함수 실행
    }
    
    const handleAddIngPedia = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewIngPedia({...newIngPedia, ingDetail: {...newIngPedia.ingDetail, [name]:value,},})
    };
    const handleSubIngPedia = (pairNo: number) => {
        const onDelete = confirm("관련 식재료를 삭제하시겠습니까?");
        onDelete && setNewIngPedia({
            ...newIngPedia,
            pairList: newIngPedia.pairList?.filter((item) =>
                !(Number(ingNo) === Number(ingNo) && item.pairNo === pairNo)),
        });
    };

    const mutation = useMutation({
        mutationFn: (newIngPedia:IngPediaUpdate) => updateIngPedia(Number(ingNo), newIngPedia),
        onSuccess: (res) => {
            // 수정 요청 성공 시
            queryClient.invalidateQueries({predicate: (query) => query.queryKey[0] === 'ingPedia',});

            navigate('/ingpedia', {
                state: {flash: "재료 정보가 수정 되었습니다."}
            });
        }
    })

    if(mutation.isPending){
        return <div>Loading...</div>
    }

    if(mutation.isError){
        console.log(newIngPedia);
        return <div className="alert alert-danger">{mutation.error.message}</div>
    }

    return (
        <>
            <div className={cx(ingDefaultStyle["ing-default"], ingDefaultStyle["container"])}>
                <section className={ingEditStyle["ing-detail"]}>
                    <div className={ingDefaultStyle[`title-area`]}>
                        <div className="flex-row gap-10">
                            <h2>재료 관리</h2>
                            <h2>＞</h2>
                            <h2>수정하기</h2>
                        </div>
                    </div>
                    <hr/>
                    <div className={cx(ingDefaultStyle["content-area"], ingEditStyle["ing-detail-section"])}>
                        <table className={ingEditStyle["ing-table"]}>
                            <thead>
                                <tr>
                                    <th colSpan={2}>
                                        <input name="ingName" type="text" className={ingEditStyle["ing-name"]} placeholder="재료명"
                                        value={newIngPedia.ingDetail.ingName} onChange={handleAddIngPedia}/>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={2} className={ingEditStyle["ing-image"]}>
                                        <img src={lodingImg.plus}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>분류</td>
                                    <td>
                                        <select name="ingCodeName" className={ingEditStyle["drop-menu"]}>
                                            <option value={newIngPedia.ingDetail.ingCode} className={ingEditStyle["drop-item"]}>{newIngPedia.ingDetail.ingCodeName ?? "전체"}</option>

                                            {/* {ingCodeName.map(
                                                (item, index) => (
                                                    <option value={index} className={ingEditStyle["drop-item"]}>{item}</option>
                                                )
                                            )} */}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>열량</td>
                                    <td className={ingEditStyle["input-area"]}>
                                        <input name="energy" type="number" placeholder="0" value={newIngPedia.ingDetail.energy ?? 0} onChange={handleAddIngPedia}/>
                                        <span>kcal</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>탄수화물</td>
                                    <td className={ingEditStyle["input-area"]}>
                                        <input name="carb" type="number" placeholder="0" value={newIngPedia.ingDetail.carb ?? 0} onChange={handleAddIngPedia}/>
                                        <span>g</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>단백질</td>
                                    <td className={ingEditStyle["input-area"]}>
                                        <input name="protein" type="number" placeholder="0" value={newIngPedia.ingDetail.protein ?? 0} onChange={handleAddIngPedia}/>
                                        <span>g</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>지방</td>
                                    <td className={ingEditStyle["input-area"]}>
                                        <input name="fat" type="number" placeholder="0" value={newIngPedia.ingDetail.fat ?? 0} onChange={handleAddIngPedia}/>
                                        <span>g</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>나트륨</td>
                                    <td className={ingEditStyle["input-area"]}>
                                        <input name="sodium" type="number" placeholder="0" value={newIngPedia.ingDetail.sodium ?? 0} onChange={handleAddIngPedia}/>
                                        <span>g</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className={ingEditStyle["tip-area"]}>
                            <h3>구매 요령 (Buying Tip)</h3>
                            <textarea name="buyingTip" placeholder="구매 요령을 입력하세요." value={newIngPedia.ingDetail.buyingTip ?? ''}
                            onChange={handleAddIngPedia}/>
                            <h3>보관법 (Storage Method)</h3>
                            <textarea name="storageMethod" placeholder="보관법을 입력하세요." value={newIngPedia.ingDetail.storageMethod ?? ''}
                            onChange={handleAddIngPedia}/>
                            <h3>손질법 (Preparation / Handling)</h3>
                            <textarea name="preparation" placeholder="손질법을 입력하세요." value={newIngPedia.ingDetail.preparation ?? ''}
                            onChange={handleAddIngPedia}/>
                            <h3>활용 팁 (Usage Tip)</h3>
                            <textarea name="usageTip" placeholder="활용 팁을 입력하세요." value={newIngPedia.ingDetail.usageTip ?? ''}
                            onChange={handleAddIngPedia}/>
                        </div>
                    </div>
                </section>
                <hr/>
                {/* <!-- 궁합 --> */}
                <section className={cx(ingEditStyle["ing-match-section"])}>
                    <div className={ingEditStyle["best-area"]}>
                        <h3>Best 궁합</h3>
                            <div className={cx("flex-row", ingEditStyle["match-content"])}>
                                <img src={lodingImg.thumbUp}/>
                                <span className={ingEditStyle["btn-group"]}>
                                    {newIngPedia.pairList?.map((item, index) => (
                                        (item.pairState == 'B') &&
                                        <button key={item.pairNo} className={cx("click-basic", "round-btn", "green", "ing-btn")}
                                        onClick={() => handleSubIngPedia(item.pairNo)}>
                                        {item.pairName}
                                        </button>
                                    ))}
                                    <button className={cx("round-btn", "green-b")} onClick={()=>openIngPopup("best")}
                                        disabled={(newIngPedia.pairList) && (newIngPedia.pairList?.filter((item) => item.pairState === 'B').length >= 3)}>+</button>
                                </span>
                            </div>
                    </div>
                    <div className={ingDefaultStyle["vt-line"]}/>
                    <div className={ingEditStyle["worst-area"]}>
                        <h3>Worst 궁합</h3>
                            <div className={cx("flex-row", ingEditStyle["match-content"])}>
                                <span className={ingEditStyle["btn-group"]}>
                                    {newIngPedia.pairList?.map((item, index) => (
                                        (item.pairState == 'W') &&
                                        <button key={item.pairNo} className={cx("click-basic", "round-btn", "orange", "ing-btn")}
                                        onClick={() => handleSubIngPedia(item.pairNo)}>
                                        {item.pairName}
                                        </button>
                                    ))}
                                    <button className={cx("round-btn", "orange-b")} onClick={()=>openIngPopup("worst")}
                                        disabled={(newIngPedia.pairList) && (newIngPedia.pairList?.filter((item) => item.pairState === 'W').length >= 3)}>+</button>
                                </span>
                                <img src={lodingImg.thumbDown}/>
                            </div>
                    </div>
                </section>
                
                <section className={ingEditStyle["admin-section"]}>
                    <hr/>
                    <div className={cx("flex-row", "gap-20", "center")}>
                        <button className={cx("click-basic", "semi-round-btn", "olive")}  onClick={insertIngPedia}>등록</button>
                    </div>
                </section>
            </div>
        </>
    )
}