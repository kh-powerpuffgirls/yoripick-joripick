import { Link, useNavigate, useParams } from "react-router-dom";
import { lodingImg } from "../../assets/images";
import "../../assets/css/button.css";
import ingDefaultStyle from "../../assets/css/ingDefault.module.css";
import MyIngDetailStyle from "./MyIngDetail.module.css"
import cx from "classnames";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { initialUpdateMyIng, type MyIngItem, type MyIngUpdate, type NewMyIng } from "../../type/Ing";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMyIng, getMyIng, updateMyIng } from "../../api/ing/myIngApi";
import { expDateIcon, expDateMessage, formatDate } from "./common";
import useInput from "../../hooks/useInput";
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { api } from "../../api/authApi";
import type { RecipeDetail, RecipeListItem } from "../../type/Recipe";

interface ApiParams {
    page?: number;
    sort?: string;
    ingredients?: string;
    rcpMthNo?: string;
    rcpStaNo?: string;
}

interface RecipeWithDetail {
  recipe: RecipeListItem;
  detail: RecipeDetail;
}

export default function MyIngDetail(){

    const userNo = useSelector((state: RootState) => state.auth.user?.userNo);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const {ingNo} = useParams();
    const [newMyIng, handleInputChange, resetMyIng, setNewMyIng] = useInput<MyIngUpdate>(initialUpdateMyIng);
    const [onUpdate, setOnUpdate] = useState(false);
    const [recipeDetail, setRecipeDetail] = useState<RecipeWithDetail[]>();

    const {data: MyIngItem, isLoading, isError, error} = useQuery<MyIngItem>({
        queryKey: ['myIngItem', ingNo], // 캐시 구분용 키
        queryFn: () => getMyIng(Number(ingNo), userNo as number),
        staleTime: 1000*60, // Fresh 유지 시간
        gcTime: 1000 *60 * 5, // 캐시 메모리 저장 시간
        enabled: !!userNo && !!ingNo,
    });
    
    useEffect(()=>{
        if (MyIngItem) {
            const { userNo, ingNo, createdAt, expDate, quantity } = MyIngItem;
            setNewMyIng({
                userNo,
                ingNo, 
                createdAt: createdAt ?? undefined,
                expDate: expDate ?? undefined,
                quantity });
        }
    },[MyIngItem]);

    useEffect(() => {
        if(MyIngItem?.ingName != '' && MyIngItem?.ingName != undefined){
            const fetchRecipes = async () => {
                try {
                    const params: ApiParams = {
                        page: 0, 
                        sort: 'bookmarks_desc',
                        ingredients: MyIngItem?.ingName,
                    };
    
                    const endpoint = `/api/recipe/${userNo}`;
                    const response = await api.get(endpoint, { params });
                    const list: RecipeListItem[] = response.data.recipes.slice(0, 2);

                    // 상세 정보 병렬 요청
                    const detailPromises = list.map(item =>
                        api.get<RecipeDetail>(`/api/recipe/detail/${item.rcpNo}`)
                    );

                    const detailResponses = await Promise.all(detailPromises);
                    const details: RecipeDetail[] = detailResponses.map(res => res.data);

                    // ✅ 병합: { recipe, detail }[]
                    const combined: RecipeWithDetail[] = list.map((recipe, index) => ({
                        recipe,
                        detail: details[index],
                    }));

                    setRecipeDetail(combined);
                } catch (error) {
                    console.error("레시피 데이터를 불러오는데 실패했습니다.", error);
                }
            };
            fetchRecipes();
        }
    }, [MyIngItem?.ingName]);
        
    const editMyIng = (e: FormEvent) => {
        e.preventDefault(); // 제출 방지
        const payload = {
            ...newMyIng,
            createdAt: new Date(newMyIng.createdAt ?? ''),
            expDate: new Date(newMyIng.expDate as Date) ?? undefined
        }
        mutation.mutate(payload); //비동기함수 실행
    }
    
    const deleteMyIngMutation = useMutation({
        mutationFn: (ingNo:number) => deleteMyIng(ingNo, userNo ?? 0),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:['myIngItem', ingNo]});
        }
    })
    const handleDelete = (ingNo:number, ingName:string) => {
        const onDelete = confirm(`${ingName}을 삭제하시겠습니까?`);
        if(onDelete) deleteMyIngMutation.mutate(ingNo);
    };
    
    const mutation = useMutation({
            mutationFn: (newMyIng:MyIngUpdate) => updateMyIng(Number(ingNo), userNo ?? 0, newMyIng),
            onSuccess: (res) => {
                // 등록 요청 성공 시
                setOnUpdate(false);
                queryClient.invalidateQueries({queryKey:['MyIngItem', ingNo]}); // 메뉴 목록 데이터 캐시 무효화
                queryClient.invalidateQueries({queryKey:['MyIngs']}); // 메뉴 목록 데이터 캐시 무효화
                alert("식재료 정보가 수정되었습니다.");
            }
    })

    if(mutation.isPending){
        return <div>Loading...</div>
    }

    if(mutation.isError){
        return <div className="alert alert-danger">{mutation.error.message}</div>
    }

    if(isLoading) return <div>Loading...</div>
    if(isError) return <div style={{color:'red'}}>{error.message}</div>
    if(!MyIngItem) return <div>값 없음</div>
    
    return (
        <>
            <div className={cx(ingDefaultStyle["ing-default"], ingDefaultStyle["container"], MyIngDetailStyle["mying-detail"])}>
                <section className={MyIngDetailStyle["ing-detail"]}>
                    <div className={ingDefaultStyle[`title-area`]}>
                        <div className="flex-row gap-10">
                            <h2>내 식재료 관리</h2>
                            <h2>&gt;</h2>
                            <h2>상세보기</h2>
                        </div>
                    </div>
                    <div className={ingDefaultStyle[`title-area`]}>
                        <h3>{MyIngItem.ingCodeName}</h3>
                        <hr className={MyIngDetailStyle["gray"]}/>
                    </div>
                    <div className={cx(ingDefaultStyle["content-area"], MyIngDetailStyle["ing-detail-section"])}>
                        
                        <div className={MyIngDetailStyle["thumb-area"]}>
                            <div className={MyIngDetailStyle["thumbnail"]}>
                                <img src={MyIngItem.imgUrl ?? lodingImg.noImage} className={MyIngDetailStyle["thumbnail-img"]}/>
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
                                <h3>수량 / 무게</h3><input type="text" value={newMyIng.quantity ?? ''} className={MyIngDetailStyle["ing-quantity"]} name="quantity" onChange={(e) => {setNewMyIng({...newMyIng, quantity: e.target.value,}); setOnUpdate(true);}}/>
                                <h3>등록일</h3>
                                <input type="date" value={formatDate(newMyIng.createdAt ?? new Date)} className={MyIngDetailStyle["ing-regidate"]} name="regidate" onChange={(e) => {setNewMyIng({...newMyIng, createdAt: new Date(e.target.value),}); setOnUpdate(true)}}/>
                                <h3>소비기한</h3>
                                <input type="date" value={formatDate(newMyIng.expDate) ?? ""} className={MyIngDetailStyle["ing-usedate"]} name="usedate" onChange={(e) => {setNewMyIng({...newMyIng, expDate: new Date(e.target.value),}); setOnUpdate(true)}}/>
                            </div>
                        </form>
                    </div>
                    <section className={MyIngDetailStyle["btn-group"]}>
                        <div className={cx("flex-row", "gap-20", "center")}>
                            <button type="submit" className={cx("click-basic", "semi-round-btn", "olive")} disabled={mutation.isPending || (onUpdate === false)} onClick={editMyIng}>수정</button>
                            <button className={cx("click-basic", "semi-round-btn", "red")}
                            onClick={
                                (e) => {
                                    e.stopPropagation();
                                    handleDelete(MyIngItem.ingNo, MyIngItem.ingName);
                                }}>삭제</button>
                        </div>
                    </section>
                </section>
                <hr/>

                {/* <!-- 관련 레시피 --> */}
                <section className={cx(MyIngDetailStyle["recipe-section"])}>
                    <div className={ingDefaultStyle[`title-area`]}>
                        <h3>관련 레시피</h3>
                        <hr className={MyIngDetailStyle["gray"]}/>
                        <Link to={`/api/recipe?ingredients=${MyIngItem.ingName}`} className={ingDefaultStyle[`more-link`]}>더보기</Link>
                    </div>


                    <div className={cx(ingDefaultStyle["content-area"])}>

                        {recipeDetail?.map((item, index) => (
                            <article key={"rcp"+item.detail.rcpNo}>
                                <Link to={`/api/recipe/${item.detail.rcpNo}`} className={MyIngDetailStyle["recipe-item"]}>
                                    <div className={MyIngDetailStyle["thumbnail"]}>
                                        <img src={item.recipe.serverName} className={MyIngDetailStyle["thumbnail-img"]}/>
                                    </div>
                                    <div className={MyIngDetailStyle["recipe-inform"]}>
                                        <h3>{item.detail.rcpName}</h3>
                                        <div className={MyIngDetailStyle["ing-list"]}><strong>재료</strong>: {item.detail.rcpIngList}</div>
                                        <div><strong>조리 방법</strong>: {item.detail.rcpMethod}</div>
                                        <div><strong>열량</strong>: {item.detail.totalNutrient.calories}kcal</div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
                

            </div>
        </>
    )
}