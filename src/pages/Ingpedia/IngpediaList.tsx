import { Link, Outlet } from "react-router-dom";
import { ingBn, lodingImg } from "../../assets/images";
import Pagination from "../../components/Pagination";
import ingStyle from "./Ingpedia.module.css"
import cx from "classnames";
import { useEffect, useState } from "react";
import { initialIngItem, type IngCode, type IngItem } from "../../type/Ing";
import { getIngCodes, searchIngs } from "../../api/ingApi";
import { useQuery } from "@tanstack/react-query";

export default function IngpediaList(){

    // const ingContent = ['단감aaaaaaaaaaaaaaaaaaaaaaaaaaaa', '연시', '감말랭이', '곶감', '구아바', '한라봉', '천혜향', '레드향', '황금향', '금귤', '다래', '대추', '건대추', '건대추야자', '두리안', '설향딸기', '딸기', '라임', '레몬', '롱안', '리치', '망고', '애플망고', '매실', '매실 당절임', '염장 매실', '머루', '머스켓베일리에이', '왕머루', '감로멜론', '머스크멜론', '모과', '무화과', '바나나', '배', '배 과즙', '버찌', '복분자', '백도복숭아', '천도복숭아'];
    
    const [ingCodeSet, setIngCodeSet] = useState<IngCode[]>([{ingCode:0, ingCodeName:''}]);
    const [ingContent, setIngContent] = useState<IngItem[]>([initialIngItem]);

    const{data:ingCodes} = useQuery({
        queryKey: ['ingCodes'],
        queryFn: () => getIngCodes(),
        staleTime: 60*1000
    })

    const{data:ingContents} = useQuery({
        queryKey: ['ingContents'],
        // queryFn: () => searchIngs(),
        queryFn: () => getIngCodes(),
        staleTime: 60*1000
    })

    useEffect(() => {
        if (ingCodes) {
            setIngCodeSet(ingCodes);
        }
    }, [ingCodes]);





    return (
        <>
            <div className={ingStyle.container}>
                <section className={ingStyle["ing-category"]}>
                    <div className={ingStyle[`title-area`]}>
                        <h2>재료 관리</h2>
                        <form action="." method="post" className={ingStyle["search-box"]}>
                            <button type="button" className={cx("semi-round-btn", "olive-b")}>등록</button>
                            <select name="ingCodeName" className={ingStyle["drop-menu"]}>
                                {ingCodeSet.map(
                                    (item, index) => (
                                        <option value={index} className={ingStyle["drop-item"]}>{item.ingCodeName}</option>
                                    )
                                )}
                            </select>
                            <input className={ingStyle["search-txt"]} type="text" placeholder="재료 검색"/>
                            <img src={lodingImg.search} className={ingStyle["search-icon"]}/>
                        </form>
                    </div>
                    <hr/>
                    {/* map 정리 필요 */}
                    <ul className={cx(ingStyle["category-list"], ingStyle["content-area"])}>
                        {ingCodeSet.map(
                        (item, index) => (
                            <li key={index}><span className={ingStyle.circle}></span><p>{item.ingCodeName}</p></li>
                        )
                        )}
                    </ul>
                </section>
                <hr/>

                

                {/* <!-- 목록 --> */}
                <section className={ingStyle[`ing-content`]}>
                    {/* ===========================================================css 추가 필요 */}
                    <div className={ingStyle[`category-banner`]}> 
                        <img src={ingBn[0]}/>
                        <h2 className={ingStyle[`category-banner-stroke`]}>{ingCodeSet[0].ingCodeName??''}</h2>
                        <h2>{ingCodeSet[0].ingCodeName??''}</h2>
                    </div>
                    <div className={ingStyle["ing-content-list"]}>
                        {/* 임시 하드코딩 데이터 */}
                        <ul className={ingStyle["ing-content-grid"]}>
                            {ingContent.map(
                            (item) => (
                                <li>
                                    <Link to="/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" className={ingStyle[`ing-item`]}>
                                        {/* <div className={ingStyle[`ing-item-text`]}>{item}</div> */}
                                        <img className={ingStyle[`arrow-icon`]} src={lodingImg.arrowRight}/>
                                    </Link>
                                </li>
                            )
                            )}
                        </ul>
                    </div>
                </section>

                {/* <Pagination/> */}
            </div>
                <Outlet />
        </>
    )
}