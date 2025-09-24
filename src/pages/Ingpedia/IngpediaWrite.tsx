import { Link, useNavigate, useParams } from "react-router-dom";
import { ingBn, lodingImg } from "../../assets/images";
import ingWriteStyle from "./IngpediaWrite.module.css"
import "../../assets/css/button.css";
import ingDefaultStyle from "../../assets/css/ingDefault.module.css";
import cx from "classnames";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { initialIng, type IngCreate, type IngPair } from "../../type/Ing";
import { openIngPopup } from "../MyIng/common";
import { createIngPedia, getIngPedia, updateIngPedia } from "../../api/ing/ingPediaApi";

export default function IngpediaWrite(){ 

    const userNo = useSelector((state: RootState) => state.auth.user?.userNo);
    const [newIng, setNewIng] = useState<IngCreate>(initialIng);
    const [pairIngs, setpairIngs] = useState<IngPair[]>([{pairNo:0, pairName: '', pairState:'N'}]);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // 이미 등록한 식재료에 잉피디아 정보 추가
    useEffect(() => {
        console.log(newIng);
        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type === 'ING_RESULT') {
                const { ingNo, ingName, ingCode, ingCodeName } = event.data.payload;
                const target = event.data.target;
                console.log(target);
                switch(target){
                    case "best":
                        setpairIngs((prev)=>([...prev, {pairNo: ingNo as number, pairName: ingName, pairState: 'B'},]));
                        break;
                    case "worst":
                        setpairIngs((prev)=>([...prev, {pairNo: ingNo as number, pairName: ingName, pairState: 'W'},]));
                        break;
                    default:
                        // // 이전 등록 여부 검사
                        // if(ingNo == '' ){
                        //     alert('이미 등록한 재료입니다.');
                        //     return;
                        // }
                        
                        try {
                            const ingTemp = await getIngPedia(ingNo);
        
                            setNewIng((prev) => ({
                                ...prev,
                                ingDetail: {
                                    ...prev.ingDetail,
                                    userNo,
                                    ingNo,
                                    ingName,
                                    ingCode,
                                    ingCodeName,
                                    energy: ingTemp.ingDetail.energy ?? 0,
                                    carb: ingTemp.ingDetail.carb ?? 0,
                                    protein: ingTemp.ingDetail.protein ?? 0,
                                    fat: ingTemp.ingDetail.fat ?? 0,
                                    sodium: ingTemp.ingDetail.sodium ?? 0,
                                },
                            }));
                        } catch (error) {
                            console.error(error);
                        }
                }
            }
        };
        
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [userNo]);

    // 아예 새로운 식재료? : 후순위...

    useEffect(() => {
        if(pairIngs[0] && pairIngs[0].pairNo === 0){
            const newPairIngs = pairIngs.slice(1);
            setpairIngs(newPairIngs);
        }
        setNewIng({...newIng, pairList:pairIngs});
        console.log(newIng);
    }, [pairIngs]);

    
    const mutation = useMutation({
        mutationFn: (newIng:IngCreate) => createIngPedia(newIng),
        onSuccess: (res) => {
            // 등록 요청 성공 시
            queryClient.invalidateQueries({predicate: (query) => query.queryKey[0] === 'ingPedia',});

            navigate('/ingpedia', {
                state: {flash: "재료 정보가 등록되었습니다."}
            });
        }
    })

    if(mutation.isPending){
        return <div>Loading...</div>
    }

    if(mutation.isError){
        console.log(newIng);
        return <div className="alert alert-danger">{mutation.error.message}</div>
    }

    const insertIngPedia = (e: FormEvent) => {
        e.preventDefault(); // 제출 방지
        if(newIng.ingDetail.ingName == null || newIng.ingDetail.ingName == '' ){
            alert('재료명을 입력하세요');
            return;
        }
        if(newIng.ingDetail.ingCodeName == null || newIng.ingDetail.ingCodeName == '' ){
            alert('재료 분류를 선택하세요');
            return;
        }
        if((newIng.ingDetail.buyingTip == null || newIng.ingDetail.buyingTip == '') &&
            (newIng.ingDetail.storageMethod == null || newIng.ingDetail.storageMethod == '') &&
            (newIng.ingDetail.preparation == null || newIng.ingDetail.preparation == '') &&
            (newIng.ingDetail.usageTip == null || newIng.ingDetail.usageTip == '')){
            alert('재료 관리 정보를 한 가지 이상 입력하세요');
            return;
        }
        console.log("newIng:", newIng);
        mutation.mutate(newIng); //비동기함수 실행
    }


    return (
        <>
            <div className={cx(ingDefaultStyle["ing-default"], ingDefaultStyle["container"])}>
                <section className={ingWriteStyle["ing-detail"]}>
                    <div className={ingDefaultStyle[`title-area`]}>
                        <div className="flex-row gap-10">
                            <h2>재료 관리</h2>
                            <h2>＞</h2>
                            <h2>등록하기</h2>
                        </div>
                    </div>
                    <hr/>
                    <div className={cx(ingDefaultStyle["content-area"], ingWriteStyle["ing-detail-section"])}>
                        <table className={ingWriteStyle["ing-table"]}>
                            <thead>
                                <tr>
                                    <th colSpan={2}>
                                        <input name="ingName" type="text" className={ingWriteStyle["ing-name"]} placeholder="재료명"
                                        value={newIng.ingDetail.ingName} onClick={() => openIngPopup()} readOnly/>
                                        {/* <button onClick={() => openIngPopup()}>재료 검색</button> */}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={2} className={ingWriteStyle["ing-image"]}>
                                        <img src={lodingImg.plus}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>분류</td>
                                    <td>
                                        <select name="ingCodeName" className={ingWriteStyle["drop-menu"]}>
                                            <option value={newIng.ingDetail.ingCode} className={ingWriteStyle["drop-item"]}>{newIng.ingDetail.ingCodeName ?? "전체"}</option>

                                            {/* {ingCodeName.map(
                                                (item, index) => (
                                                    <option value={index} className={ingWriteStyle["drop-item"]}>{item}</option>
                                                )
                                            )} */}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>열량</td>
                                    <td className={ingWriteStyle["input-area"]}>
                                        <input name="ingEnergy" type="number" placeholder="0" value={newIng.ingDetail.energy ?? 0} readOnly/>
                                        <span>kcal</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>탄수화물</td>
                                    <td className={ingWriteStyle["input-area"]}>
                                        <input name="ingCarb" type="number" placeholder="0" value={newIng.ingDetail.carb ?? 0} readOnly/>
                                        <span>g</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>단백질</td>
                                    <td className={ingWriteStyle["input-area"]}>
                                        <input name="ingProtein" type="number" placeholder="0" value={newIng.ingDetail.protein ?? 0} readOnly/>
                                        <span>g</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>지방</td>
                                    <td className={ingWriteStyle["input-area"]}>
                                        <input name="ingFat" type="number" placeholder="0" value={newIng.ingDetail.fat ?? 0} readOnly/>
                                        <span>g</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>나트륨</td>
                                    <td className={ingWriteStyle["input-area"]}>
                                        <input name="ingSodium" type="number" placeholder="0" value={newIng.ingDetail.sodium ?? 0} readOnly/>
                                        <span>g</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className={ingWriteStyle["tip-area"]}>
                            <h3>구매 요령 (Buying Tip)</h3>
                            <textarea name="buyingTip" placeholder="구매 요령을 입력하세요."
                            onChange={(e) => setNewIng(prev => ({ ...prev, ingDetail:{...prev.ingDetail, buyingTip: e.target.value }}))}/>
                            <h3>보관법 (Storage Method)</h3>
                            <textarea name="storageMethod" placeholder="보관법을 입력하세요."
                            onChange={(e) => setNewIng(prev => ({ ...prev, ingDetail:{...prev.ingDetail, storageMethod: e.target.value }}))}/>
                            <h3>손질법 (Preparation / Handling)</h3>
                            <textarea name="preparation" placeholder="손질법을 입력하세요."
                            onChange={(e) => setNewIng(prev => ({ ...prev, ingDetail:{...prev.ingDetail, preparation: e.target.value }}))}/>
                            <h3>활용 팁 (Usage Tip)</h3>
                            <textarea name="usageTip" placeholder="활용 팁을 입력하세요."
                            onChange={(e) => setNewIng(prev => ({ ...prev, ingDetail:{...prev.ingDetail, usageTip: e.target.value }}))}/>
                        </div>
                    </div>
                </section>
                <hr/>
                {/* <!-- 궁합 --> */}
                <section className={cx(ingWriteStyle["ing-match-section"])}>
                    <div className={ingWriteStyle["best-area"]}>
                        <h3>Best 궁합</h3>
                            <div className={cx("flex-row", ingWriteStyle["match-content"])}>
                                <img src={lodingImg.thumbUp}/>
                                <span className={ingWriteStyle["btn-group"]}>
                                    {pairIngs.map((item, index) => (
                                        (item.pairState == 'B') && <button key={item.pairNo} className={cx("click-basic", "round-btn", "green", "ing-btn")}>
                                        {item.pairName}
                                        </button>
                                    ))}
                                    <button className={cx("round-btn", "green-b")} onClick={()=>openIngPopup("best")}>+</button>
                                </span>
                            </div>
                    </div>
                    <div className={ingDefaultStyle["vt-line"]}/>
                    <div className={ingWriteStyle["worst-area"]}>
                        <h3>Worst 궁합</h3>
                            <div className={cx("flex-row", ingWriteStyle["match-content"])}>
                                <span className={ingWriteStyle["btn-group"]}>
                                    {pairIngs.map((item, index) => (
                                        (item.pairState == 'W') && <button key={item.pairNo} className={cx("click-basic", "round-btn", "orange", "ing-btn")}>
                                        {item.pairName}
                                        </button>
                                    ))}
                                    <button className={cx("round-btn", "orange-b")} onClick={()=>openIngPopup("worst")}>+</button>
                                </span>
                                <img src={lodingImg.thumbDown}/>
                            </div>
                    </div>
                </section>
                
                <section className={ingWriteStyle["admin-section"]}>
                    <hr/>
                    <div className={cx("flex-row", "gap-20", "center")}>
                        <button className={cx("click-basic", "semi-round-btn", "olive")}  onClick={insertIngPedia}>등록</button>
                    </div>
                </section>
            </div>
        </>
    )
}