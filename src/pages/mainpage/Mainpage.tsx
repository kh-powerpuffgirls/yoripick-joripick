import { lodingImg, lodingRecipeIcon } from "../../assets/images";
import mainStyle from "./Mainpage.module.css"
import "../../assets/css/button.css";
import ingDefaultStyle from "../../assets/css/ingDefault.module.css";
import cx from "classnames";
import { Link, useNavigate } from "react-router";
import { useCallback, useEffect, useState } from "react";
import type { IngredientOption, RcpOption, RecipeListItem, RecipePage } from "../../type/Recipe";
import { api } from "../../api/authApi";
import type { IngPediaMain } from "../../type/Ing";
import { useQuery } from "@tanstack/react-query";
import { getIngPediaMain } from "../../api/ing/ingPediaApi";
import TodayBanner from "../Admin/todayBanner";

interface SearchParams {
  ingredients?: string;
  rcpMthNo?: string;
  rcpStaNo?: string;
}


interface ApiParams {
  page?: number;
  sort?: string;
  ingredients?: string;
  rcpMthNo?: string;
  rcpStaNo?: string;
}

export default function Mainpage(){

    const navigate = useNavigate();
    

    // 레시피 분류
    const [methodOptions, setMethodOptions] = useState<RcpOption[]>([]);
    const [typeOptions, setTypeOptions] = useState<RcpOption[]>([]);
    const [rankingRecipes, setRankingRecipes] = useState<RecipeListItem[]>([]); 

    useEffect(() => {
        const fetchOptions = async () => {
            try {
            const [methodRes, typeRes] = await Promise.all([
                api.get('/api/options/methods'),
                api.get('/api/options/situations')
            ]);
            
            setMethodOptions(methodRes.data.map((item: any) => ({ id: item.rcpMthNo, name: item.rcpMethod })));
            const tempTypeOptions:RcpOption[] = (typeRes.data.map((item: any) => ({ id: item.rcpStaNo, name: item.rcpSituation })));
            const reordered = [
                ...tempTypeOptions.filter(option => option.name !== '기타'),
                ...tempTypeOptions.filter(option => option.name === '기타'),
            ];
            setTypeOptions(reordered);
            
        } catch (error) {
            console.error('레시피 분류 로딩 실패', error);
        }};
        fetchOptions();
    }, []);

    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const response = await api.get('/api/community/recipe/ranking');
                setRankingRecipes(response.data);
            } catch (error) {
                console.error("랭킹 레시피를 불러오는데 실패했습니다.", error);
            }
        };
        fetchRanking();
    }, []);
    
    const {data: IngPediaMain, isLoading, isError, error} = useQuery<IngPediaMain[]>({
        queryKey: ['ingPediaMain'], // 캐시 구분용 키
        queryFn: () => getIngPediaMain(),
        staleTime: 1000*60, // Fresh 유지 시간
        gcTime: 1000 *60 * 60 * 24, // 캐시 메모리 저장 시간
        enabled: true,
    });
    
    useEffect(() => {

    }, [IngPediaMain]);

    if(isLoading) return <div>Loading...</div>
    if(isError) return <div style={{color:'red'}}>{error.message}</div>
    if(!IngPediaMain) return <div>값 없음</div>

    const navigateRecipe = (name?: string, value?: number) => {
        if(name && value){
            const updatedParams = {[name]: String(value)};
            const query = new URLSearchParams(updatedParams).toString();
            navigate(`/api/recipe?${query}`);
        } else {
            navigate(`/api/recipe`);
        }
    };

    return (
        <>
        <TodayBanner />
            <div className={cx(ingDefaultStyle["ing-default"], ingDefaultStyle["container"], mainStyle["mainpage"])}>

             <section className={mainStyle["recipe-category"]}>
                <div className={ingDefaultStyle[`title-area`]}>
                    <h2>레시피 분류</h2>
                    <Link to={'/api/recipe'} className={ingDefaultStyle[`more-link`]}>세부검색 바로가기</Link>
                </div>
                <ul className={cx(mainStyle["category-list"], mainStyle["content-area"])}>
                    {methodOptions
                        .filter(item => item.name !== '기타')
                        .map(
                        (item, index) => (
                            <li key={"mth"+item.id}
                            onClick={() => navigateRecipe("rcpMthNo", item.id)}>
                                <span className={mainStyle.circle}>
                                    <img src={lodingRecipeIcon[index]} className={mainStyle.icon}/>
                                </span>
                                <p>{item.name}</p>
                            </li>
                        )
                    )}
                    {typeOptions.map(
                        (item,index) => (
                            <li key={"mth"+item.id}
                            onClick={() => navigateRecipe("rcpStaNo", item.id)}>
                                <span className={mainStyle.circle}>
                                    <img src={lodingRecipeIcon[index+methodOptions.length-1]} className={mainStyle.icon}/>
                                </span>
                                <p>{item.name}</p>
                            </li>
                        )
                    )}
                </ul>
                </section>

                {/* <!-- 이달의 PICK --> */}
                <section className={mainStyle[`today-pick`]}>
                    <div className={ingDefaultStyle[`title-area`]}>
                        <h2>이달의 PICK!</h2>
                        <Link to={'/community/recipe'} className={ingDefaultStyle[`more-link`]}>레시피 바로가기</Link>
                    </div>
                    <div className={cx(mainStyle["pick-list"], ingDefaultStyle["content-area"])}>
                        {rankingRecipes.slice(0, 3).map(
                            (item, index) => (
                                <article key={"rcp"+item.rcpNo} className={mainStyle[`pick-item`]} onClick={() => {navigate(`/community/recipe/${item.rcpNo}`)}}>
                                    <div className="flex-row width-100">
                                        {index == 0 && <img className={mainStyle[`rank-icon`]} src={lodingImg.crown1}/>}
                                        {index == 1 && <img className={mainStyle[`rank-icon`]} src={lodingImg.crown2}/>}
                                        {index == 2 && <img className={mainStyle[`rank-icon`]} src={lodingImg.crown3}/>}
                                        <p className={mainStyle[`pick-title`]}>{item.rcpName}</p>
                                    </div>
                                    <div className={mainStyle[`thumbnail`]}>
                                        <img src={item.serverName}/>
                                    </div>
                                </article>
                            )
                        )}
                    </div>
                </section>

                {/* <!-- 재료 관리 Tip --> */}
                <section className={mainStyle[`ingredient-tip`]}>
                     <div className={ingDefaultStyle[`title-area`]}>
                        <h2>재료 관리 Tip!</h2>
                     </div>
                <div className={cx("flex-row", "gap-20", ingDefaultStyle["content-area"])}>
                        <img src={IngPediaMain?.[0]?.imgUrl ?? lodingImg.noImage} className={mainStyle[`tip-image`]}
                        onClick={() => navigate(`/ingpedia/detail/${IngPediaMain[0].ingNo}`)}/>
                    <div className={mainStyle[`tip-content`]}>
                        <div className={mainStyle[`tip-text`]}>
                            <h3>오늘의 식재료 : {IngPediaMain[0].ingName}</h3>
                            <p>
                                {IngPediaMain[0].buyingTip}
                                {IngPediaMain[0].preparation}
                                {IngPediaMain[0].storageMethod}
                                {IngPediaMain[0].usageTip}
                            </p>
                        </div>
                        <Link to={'/ingpedia'} className={ingDefaultStyle[`more-link`]}>더 많은 재료 관리 Tip 보기</Link>
                        <div className={mainStyle[`carousel-thumbs`]}>
                            {IngPediaMain.slice(1).map(
                                (item) => (
                                    <span key={item.ingNo} className={mainStyle[`thumb`]} onClick={() => navigate(`/ingpedia/detail/${item.ingNo}`)}>
                                        <img className={mainStyle[`thumb-image`]} src={item?.imgUrl ?? lodingImg.noImage}/>
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>
                </section>

                {/* <!-- 식BTI 검사하기 --> */}
                <section className={mainStyle[`food-bti`]}>
                    <div className={ingDefaultStyle[`title-area`]}>
                        <h2>식BTI 검사하기</h2>
                        <Link to={'/eatbti'} className={ingDefaultStyle[`more-link`]}>내 식BTI 검사하기</Link>
                    </div>
                <div className={mainStyle[`bti-banner`]}>
                    <Link to={'/eatbti'}>
                        <img className={ingDefaultStyle[`content-area`]}src={lodingImg.EatBTI} alt="식BTI 검사하기"/>
                    </Link>
                </div>
                </section>
            </div>

        </>
    )
}