import axios from 'axios';
import cx from "classnames";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import myingStyle from "./MyIng.module.css";
import ingStyle from "../Ingpedia/Ingpedia.module.css";
import ingDefaultStyle from "../../assets/css/ingDefault.module.css";
import "../../assets/css/button.css";
import { lodingImg } from "../../assets/images";
import { type GroupedData, type MyIngItem } from '../../type/Ing';
import useInput from '../../hooks/useInput';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteMyIng, searchMyIngs } from '../../api/ing/myIngApi';
import { expDateIcon } from './common';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

export default function MyIngList() {
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
        queryKey: ['MyIngs', submittedKeyword],
        queryFn: () => searchMyIngs(submittedKeyword),
        staleTime: 60*1000,
        enabled: !!userNo && !!submittedKeyword.userNo,
    })

    useEffect(() => {
        if (MyIngItems) {
            const initialCollapsedState: { [key: string]: boolean } = {};
            MyIngItems.forEach((item: MyIngItem) => {
                initialCollapsedState[item.ingCodeName] = false;
            });
            setCollapsed(initialCollapsedState);
        }
        console.log(MyIngItems);
    }, [MyIngItems, submittedKeyword]);

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
            queryClient.invalidateQueries({queryKey: ['MyIngs', submittedKeyword]});
            queryClient.invalidateQueries({predicate: (query) => query.queryKey[0] === 'myIngItem',});
        }
    })
    const handleDelete = (ingNo:number, ingName:string) => {
        const onDelete = confirm(`${ingName}을 삭제하시겠습니까?`);
        if(onDelete) deleteMenuMutation.mutate(ingNo);
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
            <div className={cx(ingDefaultStyle["ing-default"], ingDefaultStyle["container"])}>
                {/* 타이틀 및 검색 */}
                <div className={ingDefaultStyle[`title-area`]}>
                    <h2>내 식재료 관리</h2>
                    <form action="." method="post" className={ingDefaultStyle["search-box"]}
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearchMyIngs();
                    }}>
                        <button type="button" className={cx("semi-round-btn", "olive-b")}
                        onClick={() => navigate(`/mypage/inglist/write`)}>재료 등록</button>
                        <input className={ingDefaultStyle["search-txt"]} type="text" placeholder="내 식재료 검색"
                        name="keyword" value={searchKeyword.keyword} onChange={onChangeKeyword}/>
                        <img src={lodingImg.search} className={ingDefaultStyle["search-icon"]} alt="검색 아이콘"
                        onClick={(e) => {
                            e.preventDefault();
                            handleSearchMyIngs();
                        }} />
                    </form>
                </div>

                <hr className={ingDefaultStyle["margin-10"]} />

                {/* 정렬 버튼 */}
                <div className={myingStyle["sort-group"]}>
                    <button type="button" className={cx("click-basic", "round-btn", "green", submittedKeyword.sortNo === 1 ? 'selected' : '')} onClick={()=>setSubmittedKeyword({...submittedKeyword, sortNo:1})}>소비기한순</button>
                    <button type="button" className={cx("click-basic", "round-btn", "green", submittedKeyword.sortNo === 2 ? 'selected' : '')} onClick={()=>setSubmittedKeyword({...submittedKeyword, sortNo:2})}>등록일순</button>
                    <button type="button" className={cx("click-basic", "round-btn", "green", submittedKeyword.sortNo === 3 ? 'selected' : '')} onClick={()=>setSubmittedKeyword({...submittedKeyword, sortNo:3})}>재료명순</button>
                </div>

                <hr className={ingDefaultStyle["margin-10"]} />

                {/* 카테고리별 출력 */}
                {MyIngItems?.length == 0 && 
                <div className={myingStyle[`center`]}>
                    등록한 식재료가 없습니다.
                </div>}
                {Object.entries(sortedGroupedData ?? {}).map(([category, items]) => (
                    <section key={category} className={cx(myingStyle["mying-group"], myingStyle["content-area"])}>
                        {/* 카테고리 타이틀 (클릭 시 접기/펼치기) */}
                        <div className={ingDefaultStyle[`title-area`]} onClick={() => toggleCategory(category)}
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
                            <div className={cx(myingStyle["mying-part-grid"], ingDefaultStyle["content-area"])}>
                                {items.map(item => (
                                    <article key={item.ingNo} className={myingStyle[`mying-item`]}
                                    onClick={() => navigate(`/mypage/inglist/detail/${item.ingNo}`)}>
                                        <div className={myingStyle[`thumbnail`]}>
                                            {/* <img className={myingStyle[`thumbnail-img`]} src={lodingImg.noImage}/> */}
                                            <img className={myingStyle[`thumbnail-img`]} src={item.imgUrl ?? lodingImg.noImage}/>
                                            {expDateIcon(item)} {/* D-day / 경고 아이콘 */}
                                        </div>
                                        <div className={myingStyle[`mying-title`]}>
                                            <p>{item.ingName} {item.quantity ? `(${item.quantity})` : ''}</p>
                                            <img className={myingStyle[`cancel-icon`]} src={lodingImg.cancel} onClick={(e) => {e.stopPropagation();handleDelete(item.ingNo, item.ingName);}}/>
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
