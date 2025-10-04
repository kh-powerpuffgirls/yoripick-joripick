import { Link, useNavigate, useParams } from "react-router-dom";
import { lodingImg } from "../../assets/images";
import cx from "classnames";
import ingDetailStyle from "./IngpediaDetail.module.css"
import "../../assets/css/button.css";
import ingDefaultStyle from "../../assets/css/ingDefault.module.css";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IngPedia } from "../../type/Ing";
import { deleteIngPedia, getIngPedia } from "../../api/ing/ingPediaApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

export default function IngpediaDetail(){

    const isAdmin = useSelector((state: RootState) => state.auth.user?.roles?.includes("ROLE_ADMIN"));
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { ingNo } = useParams();

    const {data: IngPediaItem, isLoading, isError, error} = useQuery<IngPedia>({
        queryKey: ['ingPedia', ingNo], // 캐시 구분용 키
        queryFn: () => getIngPedia(Number(ingNo)),
        staleTime: 1000*60, // Fresh 유지 시간
        gcTime: 1000 *60 * 5, // 캐시 메모리 저장 시간
        enabled: true
    });
    
    const deleteIngPediaMutation = useMutation({
        mutationFn: (ingNo:number) => deleteIngPedia(ingNo),
        onSuccess: () => {
            queryClient.invalidateQueries({predicate: (query) => query.queryKey[0] === 'ingPedia',});
        }
    })
    const handleDelete = (ingNo:number) => {
        const onDelete = confirm("재료 관리 정보를 삭제하시겠습니까?");
        if(onDelete){
            deleteIngPediaMutation.mutate(ingNo);
            navigate(`/ingpedia`, {
                state: {flash: "재료 관리 정보가 삭제되었습니다."}
            });
        }
    };
    
    if(isLoading) return <div>Loading...</div>
    if(isError) return <div style={{color:'red'}}>{error.message}</div>
    if(!IngPediaItem) return <div>값 없음</div>
    
    return (
        <>
            <div className={cx(ingDefaultStyle["ing-default"], ingDefaultStyle["container"])}>
                <section className={ingDetailStyle["ing-detail"]}>
                    <div className={ingDefaultStyle[`title-area`]}>
                        <div className="flex-row gap-10">
                            <h2>재료 관리</h2>
                            <h2>＞</h2>
                            <h2>상세보기</h2>
                        </div>
                    </div>
                    <hr/>
                    <div className={cx(ingDefaultStyle["content-area"], ingDetailStyle["ing-detail-section"])}>
                        <div>
                            <table className={ingDetailStyle["ing-table"]}>
                                <thead>
                                    <tr>
                                        <th colSpan={2} className={ingDetailStyle["ing-name"]}>{IngPediaItem.ingDetail?.ingName}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={2} className={ingDetailStyle["ing-image"]}>
                                            <img src={IngPediaItem.ingDetail?.imgUrl ?? lodingImg.noImage}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>분류</td>
                                        <td>{IngPediaItem.ingDetail.ingCodeName}</td>
                                    </tr>
                                    <tr>
                                        <td>열량</td>
                                        <td>{IngPediaItem.ingDetail.energy}kcal</td>
                                    </tr>
                                    <tr>
                                        <td>탄수화물</td>
                                        <td>{IngPediaItem.ingDetail.carb}g</td>
                                    </tr>
                                    <tr>
                                        <td>단백질</td>
                                        <td>{IngPediaItem.ingDetail.protein}g</td>
                                    </tr>
                                    <tr>
                                        <td>지방</td>
                                        <td>{IngPediaItem.ingDetail.fat}g</td>
                                    </tr>
                                    <tr>
                                        <td>나트륨</td>
                                        <td>{IngPediaItem.ingDetail.sodium}mg</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className={ingDetailStyle["gray"]}>* 100g당 함량 영양 성분</div>
                        </div>
                        <div className={ingDetailStyle["tip-area"]}>
                            {IngPediaItem.ingDetail.buyingTip && <><h3>구매 요령 (Buying Tip)</h3>
                            <pre>{IngPediaItem.ingDetail.buyingTip}</pre></>}
                            {IngPediaItem.ingDetail.storageMethod && <><h3>보관법 (Storage Method)</h3>
                            <pre>{IngPediaItem.ingDetail.storageMethod}</pre></>}
                            {IngPediaItem.ingDetail.preparation && <><h3>손질법 (Preparation / Handling)</h3>
                            <pre>{IngPediaItem.ingDetail.preparation}</pre></>}
                            {IngPediaItem.ingDetail.usageTip && <><h3>활용 팁 (Usage Tip)</h3>
                            <pre>{IngPediaItem.ingDetail.usageTip}</pre></>}

                            {!IngPediaItem.ingDetail.buyingTip && !IngPediaItem.ingDetail.storageMethod &&
                            !IngPediaItem.ingDetail.preparation && !IngPediaItem.ingDetail.usageTip &&
                            <pre>* 관리 정보가 등록되지 않았습니다.</pre>}
                        </div>
                    </div>
                </section><hr/>
                {/* <!-- 궁합 --> */}
                {IngPediaItem.pairList && IngPediaItem.pairList.length > 0 &&
                <div>
                    <section className={cx(ingDetailStyle["ing-match-section"])}>
                        <div className={ingDetailStyle["best-area"]}>
                            <h3>Best 궁합</h3>
                                <div className={cx("flex-row", ingDetailStyle["match-content"])}>
                                    <img src={lodingImg.thumbUp}/>
                                    <span className={ingDetailStyle["btn-group"]}>
                                        {IngPediaItem.pairList?.map(
                                            (item) => item.pairState == "B" ? (
                                                <button key={item.pairNo} className={cx("click-basic", "round-btn", "green")}
                                                onClick={()=>navigate(`/ingpedia/detail/${item.pairNo}`)}>{item.pairName}</button>
                                            ) : null
                                        )}
                                    </span>
                                </div>
                        </div>
                        <div className={ingDefaultStyle["vt-line"]}/>
                        <div className={ingDetailStyle["worst-area"]}>
                            <h3>Worst 궁합</h3>
                                <div className={cx("flex-row", ingDetailStyle["match-content"])}>
                                    <span className={ingDetailStyle["btn-group"]}>
                                        {IngPediaItem.pairList?.map(
                                            (item) => item.pairState === "W" ? (
                                                <button key={item.pairNo} className={cx("click-basic", "round-btn", "orange")}>{item.pairName}</button>
                                            ) : null
                                        )}
                                    </span>
                                    <img src={lodingImg.thumbDown}/>
                                </div>
                        </div>
                    </section>
                    <hr/>
                </div>}
                
                {isAdmin && <section className={ingDetailStyle["admin-section"]}>
                    <div className={cx("flex-row", "gap-20", "center")}>
                        <button className={cx("click-basic", "semi-round-btn", "olive")} onClick={() => navigate(`/ingpedia/edit/${IngPediaItem.ingDetail.ingNo}`)}>수정</button>
                        <button className={cx("click-basic", "semi-round-btn", "red")}
                        onClick={(e) => {e.stopPropagation(); handleDelete(Number(ingNo));}}>삭제</button>
                    </div>
                </section>}
            </div>
        </>
    )
}