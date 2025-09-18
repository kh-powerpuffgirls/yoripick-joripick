import { useEffect, useState } from 'react';
import axios from 'axios';
import { lodingImg } from "../../assets/images";
import myingStyle from "./MyIng.module.css";
import ingStyle from "../Ingpedia/Ingpedia.module.css";
import cx from "classnames";
import { useNavigate } from 'react-router-dom';
import { type GroupedData, type MyIngItem } from '../../type/Ing';
import useInput from '../../hooks/useInput';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteMyIng, searchMyIngs } from '../../api/myIngApi';
import { expDateIcon } from './common';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

export default function MyIngList() {
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const userNo = useSelector((state: RootState) => state.auth.user?.userNo);

    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState<{[key: string]: boolean}>({});

    // 검색 및 정렬 기능
    const [searchKeyword, onChangeKeyword] = useInput({
        userNo: 0,
        sortNo: 1,
        keyword:''
    });

    const [submittedKeyword, setSubmittedKeyword] = useState({
        userNo: 0,
        sortNo: 1,
        keyword:''
    });

    useEffect(() => {
        if (submittedKeyword.userNo == 0 || !submittedKeyword.userNo) {
            setSubmittedKeyword({...submittedKeyword, userNo: userNo as number})
        }
    }, [userNo]);

    const{data:MyIngItems, isLoading, isError, error} = useQuery({
        queryKey: ['MyIngItems', submittedKeyword],
        queryFn: () => searchMyIngs(submittedKeyword),
        staleTime: 60*1000
    })

    useEffect(() => {
        if (MyIngItems) {
            const initialCollapsedState: { [key: string]: boolean } = {};
            MyIngItems.forEach((item: MyIngItem) => {
                initialCollapsedState[item.ingCodeName] = false;
            });
            setCollapsed(initialCollapsedState);
        }
    }, [MyIngItems]);

    const handleSearchMyIngs = () => {
        setSubmittedKeyword({...submittedKeyword, keyword: searchKeyword.keyword});
        searchMyIngs(submittedKeyword);
        console.log("검색중...");
        console.log(submittedKeyword);
    };


    const queryClient = useQueryClient();
    const deleteMenuMutation = useMutation({
        mutationFn: (ingNo:number) => deleteMyIng(ingNo, userNo as number),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['MyIngItems', submittedKeyword]});
        }
    })
    const handleDelete = (ingNo:number) => {
        deleteMenuMutation.mutate(ingNo);
    };

    if(isLoading) return <div>Loading...</div>
    if(isError) return <div className="alert alert-danger">{error.message}</div>

    // API 호출 및 카테고리 접힘 상태 초기화
    const initialCollapsed: { [key: string]: boolean } = {};
    
    // 카테고리별 데이터 그룹화
    const groupedData = MyIngItems?.reduce((acc: GroupedData, item: MyIngItem) => {
        const { ingCodeName } = item;
        if (!acc[ingCodeName]) {
            acc[ingCodeName] = [];
        }
        acc[ingCodeName].push(item);
        return acc;
    }, {} as GroupedData);

    const sortedGroupedData = Object.keys(groupedData ?? {})
        .sort((a, b) => {
            return groupedData![a][0].ingCode - groupedData![b][0].ingCode;
        })
        .reduce((acc, key) => {
            acc[key] = groupedData![key];
            return acc;
        }, {} as GroupedData);

    // 카테고리 토글 핸들러
    const toggleCategory = (categoryName:string) => {
        setCollapsed((prev) => ({
            ...prev,
            [categoryName]: !prev[categoryName]
        }));
    };

    return (
        <>
            <div className={myingStyle.container}>
                {/* 타이틀 및 검색 */}
                <div className={myingStyle[`title-area`]}>
                    <h2>내 식재료 관리</h2>
                    <form action="." method="post" className={ingStyle["search-box"]}
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearchMyIngs();
                    }}>
                        <button type="button" className={cx("semi-round-btn", "olive-b")}
                        onClick={() => navigate(`/mypage/inglist/write`)}>재료 등록</button>
                        <input className={ingStyle["search-txt"]} type="text" placeholder="내 식재료 검색"
                        name="keyword" value={searchKeyword.keyword} onChange={onChangeKeyword}/>
                        <img src={lodingImg.search} className={ingStyle["search-icon"]} alt="검색 아이콘"
                        onClick={(e) => {
                            e.preventDefault();
                            handleSearchMyIngs();
                        }} />
                    </form>
                </div>

                <hr className={myingStyle["margin-10"]} />

                {/* 정렬 버튼 */}
                <div className={myingStyle["sort-group"]}>
                    <button type="button" className={cx("click-basic", "round-btn", "green", "selected")} onClick={()=>setSubmittedKeyword({...submittedKeyword, sortNo:1})}>소비기한순</button>
                    <button type="button" className={cx("click-basic", "round-btn", "green")} onClick={()=>setSubmittedKeyword({...submittedKeyword, sortNo:2})}>등록일순</button>
                    <button type="button" className={cx("click-basic", "round-btn", "green")} onClick={()=>setSubmittedKeyword({...submittedKeyword, sortNo:3})}>재료명순</button>
                </div>

                <hr />

                {/* 카테고리별 출력 */}
                {Object.entries(sortedGroupedData ?? {}).map(([category, items]) => (
                    <section key={category} className={cx(myingStyle["mying-group"], myingStyle["content-area"])}>
                        {/* 카테고리 타이틀 (클릭 시 접기/펼치기) */}
                        <div className={myingStyle[`title-area`]} onClick={() => toggleCategory(category)}
                            style={{ cursor: 'pointer' }}>
                            <h3>
                                {category}
                                {" ("+items.length+")"}
                                {" "}
                            </h3>
                            <hr className={myingStyle["gray"]} />
                            <span style={{ fontSize: "0.8rem", color: "#888" }}>
                                {collapsed[category] ? "▼" : "▲"}
                            </span>
                        </div>

                        {/* 재료 리스트 */}
                        {!collapsed[category] && (
                            <div className={cx(myingStyle["mying-part-grid"], myingStyle["content-area"])}>
                                {items.map(item => (
                                    <article key={item.ingNo} className={myingStyle[`mying-item`]}
                                    onClick={() => navigate(`/mypage/inglist/detail/${item.ingNo}`)}>
                                        <div className={myingStyle[`thumbnail`]}>
                                            <img className={myingStyle[`thumbnail-img`]} src={lodingImg.noImage}/>
                                            {expDateIcon(item)} {/* D-day / 경고 아이콘 */}
                                        </div>
                                        <div className={myingStyle[`mying-title`]}>
                                            <p>{item.ingName} {item.quantity ? `(${item.quantity})` : ''}</p>
                                            <img className={myingStyle[`cancel-icon`]} src={lodingImg.cancel} onClick={(e) => {e.stopPropagation();handleDelete(item.ingNo);}}/>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                ))}
            </div>
        </>
    );
}
