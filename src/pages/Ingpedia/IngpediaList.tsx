import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { lodingImg, lodingIngBn, lodingIngIcon } from "../../assets/images";
import Pagination from "../../components/Pagination";
import ingStyle from "./Ingpedia.module.css"
import "../../assets/css/button.css";
import ingDefaultStyle from "../../assets/css/ingDefault.module.css";
import cx from "classnames";
import { useEffect, useMemo, useState } from "react";
import { initialIngItem, type IngCode, type IngItem } from "../../type/Ing";
import { getIngCodes, searchIngs } from "../../api/ing/ingApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useInput from "../../hooks/useInput";
import type { PageInfo } from "../../api/adminApi";
import { searchIngPedia } from "../../api/ing/ingPediaApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const bannerImg = lodingIngBn;

export default function IngpediaList(){
    
    const queryClient = useQueryClient();
    const isAdmin = useSelector((state: RootState) => state.auth.user?.roles?.includes("ROLE_ADMIN"));
    const [ingCodeSet, setIngCodeSet] = useState<IngCode[]>([{ingCode:0, ingCodeName:''}]);
    const navigate = useNavigate();
    
    const preloadImages = (imageUrls: string[]) => {
        imageUrls.forEach((url) => {
            const img = new Image();
            img.src = url;
        });
    };

    const [searchKeyword, onChangeKeyword] = useInput({
        ingCode:0,
        keyword: '',
        page: 0
    });
    const [submittedKeyword, setSubmittedKeyword] = useState({
        ingCode:0,
        keyword: '',
        page: 0
    });
    const [ingPageInfo, setIngPageInfo] = useState<PageInfo>({
        listCount: 0,
        currentPage: 0,
        pageLimit: 0,
        itemLimit: 0,
        maxPage: 0,
        startPage: 0,
        endPage: 0
    });


    const{data:ingCodes} = useQuery({
        queryKey: ['ingCodes'],
        queryFn: () => getIngCodes(),
        staleTime: 60*1000
    })
    const{data:ingContents} = useQuery({
        queryKey: ['ingPedia', submittedKeyword],
        queryFn: () => searchIngPedia(submittedKeyword),
        staleTime: 60*1000
    })

    useEffect(() => {
        if (ingCodes) {setIngCodeSet(ingCodes);}
        if (ingContents?.pageInfo) {setIngPageInfo(ingContents.pageInfo);}
    }, [ingCodes, ingContents]);
    
    useEffect(() => {
        preloadImages(bannerImg);
    }, []);

    const handleSearchIngPedia = () => {
        setSubmittedKeyword(searchKeyword);
    };

    const fetchIngData = (page:number) => {
        setSubmittedKeyword({ ...submittedKeyword, page: page});
    };

    return (
        <>
            <div className={cx(ingDefaultStyle["ing-default"], ingDefaultStyle["container"])}>
                <section className={ingStyle["ing-category"]}>
                    <div className={ingDefaultStyle[`title-area`]}>
                        <h2>재료 관리</h2>
                        <form action="." method="post" className={ingDefaultStyle["search-box"]}
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSearchIngPedia();
                        }}>
                            {isAdmin && <button type="button" className={cx("semi-round-btn", "olive-b")}
                            onClick={
                                (e) => {
                                    e.stopPropagation();
                                    navigate(`/ingpedia/write`);
                                }
                            }>등록</button>}
                            <select className={ingStyle["drop-menu"]} name="ingCode" onChange={onChangeKeyword} value={searchKeyword.ingCode}>
                                {ingCodeSet.map(
                                    (item, index) => (
                                        <option key={item.ingCode} value={index} className={ingStyle["drop-item"]}>{item.ingCodeName}</option>
                                    )
                                )}
                            </select>
                            <input className={ingStyle["search-txt"]} type="text" placeholder="재료 검색" name="keyword" onChange={onChangeKeyword}/>
                            <img src={lodingImg.search} className={ingDefaultStyle["search-icon"]}
                                onClick={(e) => {
                                e.preventDefault();
                                handleSearchIngPedia();
                            }}/>
                        </form>
                    </div>
                    <hr/>
                    {/* map 정리 필요 */}
                    <ul className={cx(ingStyle["category-list"], ingDefaultStyle["content-area"])}>
                        {ingCodeSet.map(
                        (item, index) => (
                            <li key={item.ingCode} onClick={()=>setSubmittedKeyword({ingCode:item.ingCode, keyword:'', page:0})}
                                className={submittedKeyword.ingCode === item.ingCode ? ingStyle.selected : ''}>
                                <span className={ingStyle.circle}>
                                    <img src={lodingIngIcon[index-1]} className={ingDefaultStyle["ing-icon"]}/>
                                </span><p>{item.ingCodeName}</p>
                            </li>
                        ))}
                    </ul>
                </section>
                <hr/>

                {/* <!-- 목록 --> */}
                <section className={ingStyle[`ing-content`]}>
                    <div className={ingStyle[`category-banner`]}> 
                        <img src={bannerImg[submittedKeyword.ingCode]}/>
                        <h2 className={ingStyle[`category-banner-stroke`]}>{ingCodeSet[submittedKeyword.ingCode].ingCodeName}</h2>
                        <h2>{ingCodeSet[submittedKeyword.ingCode].ingCodeName}</h2>
                    </div>
                    <div className={ingStyle["ing-content-list"]}>
                        <ul className={ingStyle["ing-content-grid"]}>
                            {ingContents?.ingList.map(
                            (item) => (
                                <li key={item.ingNo} className={ingStyle[`ing-item`]} onClick={() => navigate(`/ingpedia/detail/${item.ingNo}`)}>
                                    <div className={ingStyle[`ing-item-text`]}>{item.ingName}</div>
                                    <img className={ingStyle[`arrow-icon`]} src={lodingImg.arrowRight}/>
                                </li>
                            )
                            )}
                        </ul>
                    </div>
                </section>

                <Pagination
                    pageInfo={ingPageInfo}
                    onPageChange={(page)=> fetchIngData(page)}
                />
                <a href="https://www.flaticon.com/kr/free-icons/" className={ingDefaultStyle['more-link']} title="과일 아이콘">과일 아이콘 제작자: Freepik - Flaticon</a>
            </div>
        </>
    )
}