import { lodingImg } from "../../assets/images";
import mainStyle from "./Mainpage.module.css"
import "../../assets/css/button.css";
import ingDefaultStyle from "../../assets/css/ingDefault.module.css";
import cx from "classnames";
import { Link, useNavigate } from "react-router";
import { useCallback, useEffect, useState } from "react";
import type { IngredientOption, RcpOption, RecipeListItem, RecipePage } from "../../type/Recipe";
import { api } from "../../api/authApi";

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
    
    // 상태 관리
    const [recipePage, setRecipePage] = useState<RecipePage>({
      recipes: [], totalPages: 0, totalElements: 0,
    });
    const [rankingRecipes, setRankingRecipes] = useState<RecipeListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams, setSearchParams] = useState<ApiParams>({
      page: 0, 
      sort: 'createdAt',
    });

    // 레시피 분류
    const [selectedIngredients, setSelectedIngredients] = useState<IngredientOption[]>([]);
    const [rcpMthNo, setRcpMthNo] = useState('');
    const [rcpStaNo, setRcpStaNo] = useState('');
    const [ingredientInput, setIngredientInput] = useState('');
    const [searchResults, setSearchResults] = useState<IngredientOption[]>([]);
    const [methodOptions, setMethodOptions] = useState<RcpOption[]>([]);
    const [typeOptions, setTypeOptions] = useState<RcpOption[]>([]);

    useEffect(() => {
    const fetchOptions = async () => {
        try {
        const [methodRes, typeRes] = await Promise.all([
            api.get('/api/options/methods'),
            api.get('/api/options/situations')
        ]);
        setMethodOptions(methodRes.data.map((item: any) => ({ id: item.rcpMthNo, name: item.rcpMethod })));
        setTypeOptions(typeRes.data.map((item: any) => ({ id: item.rcpStaNo, name: item.rcpSituation })));
        } catch (error) {
        console.error('레시피 분류 로딩 실패', error);
        }
    };

    fetchOptions();
    }, []);

    useEffect(() => {
        // "기타"를 마지막으로 이동
        const reordered = [
        ...typeOptions.filter(option => option.name !== '기타'),
        ...typeOptions.filter(option => option.name === '기타'),
        ];
        setTypeOptions(reordered);
    }, []);

    const navigateRecipe = (name?: string, value?: number) => {
        if(name && value){
            const updatedParams = {[name]: String(value)};
            setSearchParams(updatedParams);
            const query = new URLSearchParams(updatedParams).toString();
            navigate(`/api/recipe?${query}`);
        } else {
            navigate(`/api/recipe`);
        }
    };

    // 랭킹 레시피
    useEffect(() => {
        const fetchRanking = async () => {
            try {
                const rankResponse = await api.get('/api/community/recipe/ranking');
                setRankingRecipes(rankResponse.data);
            } catch (error) {
                console.error("랭킹 레시피를 불러오는데 실패했습니다.", error);
            }
        };
        fetchRanking();
    }, []);

    return (
        <>
            <div className={cx(ingDefaultStyle["ing-default"], ingDefaultStyle["container"], mainStyle["mainpage"])}>

             <section className={mainStyle["recipe-category"]}>
                <div className={ingDefaultStyle[`title-area`]}>
                    <h2>레시피 분류</h2>
                    <Link to={'/api/recipe'} className={ingDefaultStyle[`more-link`]}>세부검색 바로가기</Link>
                </div>
                <ul className={cx(mainStyle["category-list"], mainStyle["content-area"])}>
                    {methodOptions.map(
                        (item) => (
                            (item.name != '기타') && 
                            <li key={item.id}
                            onClick={() => navigateRecipe("rcpMthNo", item.id)}>
                                <span className={mainStyle.circle}></span><p>{item.name}</p></li>
                        )
                    )}
                    {typeOptions.map(
                        (item) => (
                            <li key={item.id}
                            onClick={() => navigateRecipe("rcpStaNo", item.id)}>
                                <span className={mainStyle.circle}></span><p>{item.name}</p>
                            </li>
                        )
                    )}
                </ul>
                </section>

                {/* <!-- 오늘의 PICK --> */}
                <section className={mainStyle[`today-pick`]}>
                    <div className={ingDefaultStyle[`title-area`]}>
                        <h2>오늘의 PICK!</h2>
                        <Link to={'/api/recipe'} className={ingDefaultStyle[`more-link`]}>레시피 바로가기</Link>
                    </div>
                    <div className={cx(mainStyle["pick-list"], ingDefaultStyle["content-area"])}>
                        <article className={mainStyle[`pick-item`]}>
                            <div className="flex-row width-100">
                                <img className={mainStyle[`rank-icon`]} src={lodingImg.crown1}/>
                                <p className={mainStyle[`pick-title`]}>(1줄 이상 ...처리) 팽이버섯 무밥 말이 15분 완성!</p>
                            </div>
                            <div className={mainStyle[`thumbnail`]}></div>
                        </article>
                        <article className={mainStyle[`pick-item`]}>
                            <div className="flex-row">
                                <img className={mainStyle[`rank-icon`]} src={lodingImg.crown2}/>
                                <p className={mainStyle[`pick-title`]}>새송이 버섯 버터 크림소스 볶음</p>
                            </div>
                            <div className={mainStyle[`thumbnail`]}></div>
                        </article>
                        <article className={mainStyle[`pick-item`]}>
                            <div className="flex-row">
                                <img className={mainStyle[`rank-icon`]}src={lodingImg.crown3}/>
                                <p className={mainStyle[`pick-title`]}>앞다리살 감자 조림</p>
                            </div>
                            <div className={mainStyle[`thumbnail`]}></div>
                        </article>
                    </div>
                </section>

                {/* <!-- 재료 관리 Tip --> */}
                <section className={mainStyle[`ingredient-tip`]}>
                     <div className={ingDefaultStyle[`title-area`]}>
                        <h2>재료 관리 Tip!</h2>
                     </div>
                <div className={cx("flex-row", "gap-20", ingDefaultStyle["content-area"])}>
                        <img src={lodingImg.logo} className={mainStyle[`tip-image`]}/>
                    <div className={mainStyle[`tip-content`]}>
                        <div className={mainStyle[`tip-text`]}>
                            <h3>신선하고 맛있는 브로콜리 보관 방법</h3>
                            <p>
                                (3줄 이상 줄임 처리) ‘꽃양배추’라고도 불리는 ‘브로콜리’는 저자 과에 속하는 녹색 채소로 샐러드, 
                                스프 등 외국음식 조리에 많이 사용되는 재료 중 하나며 다량의 항산화 물질과 
                                칼슘이 함유되어 있어aaaaa aaaa aaaa aaaaaaaaa aaaaa aaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaa
                            </p>
                        </div>
                        <Link to={'/api/recipe'} className={ingDefaultStyle[`more-link`]}>더 많은 재료 관리 Tip 보기</Link>
                        <div className={mainStyle[`carousel-thumbs`]}>
                            <span className={mainStyle[`thumb`]}></span>
                            <span className={mainStyle[`thumb`]}></span>
                            <span className={mainStyle[`thumb`]}></span>
                            <span className={mainStyle[`thumb`]}></span>
                        </div>
                    </div>
                </div>
                </section>

                {/* <!-- 식BTI 검사하기 --> */}
                <section className={mainStyle[`food-bti`]}>
                    <div className={ingDefaultStyle[`title-area`]}>
                        <h2>식BTI 검사하기</h2>
                        <Link to={'/api/recipe'} className={ingDefaultStyle[`more-link`]}>내 식BTI 검사하기</Link>
                    </div>
                <div className={mainStyle[`bti-banner`]}>
                    <img className={ingDefaultStyle[`content-area`]}src={lodingImg.EatBTI} alt="식BTI 검사하기"/>
                </div>
                </section>
            </div>

        </>
    )
}