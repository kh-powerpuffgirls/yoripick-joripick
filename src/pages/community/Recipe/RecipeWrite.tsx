import { useEffect, useRef, useState } from 'react';
import {api} from '../../../api/authApi';
import { useNavigate } from 'react-router-dom';

// CSS 모듈 및 자식 컴포넌트 import
import write from './CommunityRecipeWrite.module.css';
import NutrientInfo from './NutrientInfo';
import IngredientModal from './modal/IngredientModal';

// 아이콘 이미지 import
import scaleIcon from '../../../assets/sample/저울아이콘.png';
import cookingIcon from '../../../assets/sample/요리아이콘.png';
import minusIcon from '../../../assets/sample/minus_icon.png';
import addIcon from '../../../assets/sample/add_icon.png';
import CommunityHeader from '../Header/CommunityHeader';

// 타입 import
import type { 
  AddedIngredient,
  CookingStepForForm,
  NutrientData,
  SelectOption,
  IngredientForServer
} from '../../../type/Recipe';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';

// 컴포넌트 시작
const RecipeWrite: React.FC = () => {
    const userNo = useSelector((state: RootState) => state.auth.user?.userNo);
    const navigate = useNavigate();

    // --- State 관리 ---
    const [rcpName, setRcpName] = useState('');
    const [rcpInfo, setRcpInfo] = useState('');
    const [tag, setTag] = useState('');
    const [rcpMthNo, setRcpMthNo] = useState<string>('');
    const [rcpStaNo, setRcpStaNo] = useState<string>('');
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const [ingredients, setIngredients] = useState<AddedIngredient[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalNutrients, setTotalNutrients] = useState<NutrientData>({
        calories: 0, carbs: 0, protein: 0, fat: 0, sodium: 0
    });
    const [cookingSteps, setCookingSteps] = useState<CookingStepForForm[]>([
        { id: Date.now(), description: '', image: null, imagePreview: undefined }
    ]);
    const [methodOptions, setMethodOptions] = useState<SelectOption[]>([]);
    const [typeOptions, setTypeOptions] = useState<SelectOption[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- useEffect Hooks ---
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
                console.error('요리 옵션 정보를 불러오는 데 실패했습니다.', error);
                alert('요리 옵션 정보를 불러올 수 없습니다.');
            }
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        const totals: NutrientData = ingredients.reduce((acc, curr) => {
            acc.calories += curr.nutrients.calories;
            acc.carbs    += curr.nutrients.carbs;
            acc.protein  += curr.nutrients.protein;
            acc.fat      += curr.nutrients.fat;
            acc.sodium   += curr.nutrients.sodium;
            return acc;
        }, { calories: 0, carbs: 0, protein: 0, fat: 0, sodium: 0 });

        for (const key in totals) {
            totals[key as keyof NutrientData] = Math.round(totals[key as keyof NutrientData]);
        }
        setTotalNutrients(totals);
    }, [ingredients]);

    useEffect(() => {
        return () => {
            if (mainImagePreview) {
                URL.revokeObjectURL(mainImagePreview);
            }
            cookingSteps.forEach(step => {
                if (step.imagePreview) {
                    URL.revokeObjectURL(step.imagePreview);
                }
            });
        };
    }, [mainImagePreview, cookingSteps]);

    // --- 이벤트 핸들러 함수들 ---
    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMainImage(file);
            const previewUrl = URL.createObjectURL(file);
            setMainImagePreview(previewUrl);
        }
    };

    const handleAddIngredientFromModal = (newIngredient: AddedIngredient) => {
        setIngredients(prevIngredients => [...prevIngredients, newIngredient]);
        setIsModalOpen(false);
    };

    const handleRemoveIngredient = (idToRemove: number) => {
        setIngredients(ingredients.filter(ing => ing.id !== idToRemove));
    };

    const handleAddCookingStep = () => {
        if (cookingSteps.length >= 20) {
            alert("요리 순서는 최대 20개까지 추가할 수 있습니다.");
            return;
        }
        const newStep: CookingStepForForm = { id: Date.now(), description: '', image: null, imagePreview: undefined };
        setCookingSteps([...cookingSteps, newStep]);
    };
    
    const handleRemoveCookingStep = (idToRemove: number) => {
        if (cookingSteps.length > 1) {
            setCookingSteps(cookingSteps.filter(step => {
                if (step.id === idToRemove && step.imagePreview) {
                    URL.revokeObjectURL(step.imagePreview);
                }
                return step.id !== idToRemove;
            }));
        } else {
            alert("요리 순서는 최소 1개 이상이어야 합니다.");
        }
    };
    
    const handleStepDescriptionChange = (id: number, value: string) => {
        setCookingSteps(steps => steps.map(step =>
            step.id === id ? { ...step, description: value } : step
        ));
    };

    const handleStepImageChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const previewUrl = URL.createObjectURL(file);
            setCookingSteps(steps => steps.map(step => {
                if (step.id === id) {
                    if (step.imagePreview) {
                        URL.revokeObjectURL(step.imagePreview);
                    }
                    return { ...step, image: file, imagePreview: previewUrl };
                }
                return step;
            }));
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        if (!rcpName.trim() || !rcpInfo.trim() || !rcpMthNo || !rcpStaNo || !mainImage) {
            alert('기본정보(제목, 소개, 요리정보, 대표사진)는 모두 필수 항목입니다.');
            return;
        }
        if (ingredients.length === 0) {
            alert('재료는 1개 이상 추가해야 합니다.');
            return;
        }
        if (cookingSteps.some(step => !step.description.trim())) {
            alert('모든 요리 순서의 설명을 작성해야 합니다.');
            return;
        }
        
        // setIsSubmitting(true);
        const formData = new FormData();

        formData.append('rcpName', rcpName);
        formData.append('rcpInfo', rcpInfo);
        formData.append('tag', tag);
        formData.append('rcpMthNo', rcpMthNo);
        formData.append('rcpStaNo', rcpStaNo);
        
        const ingredientsToServer: IngredientForServer[] = ingredients.map(ing => ({
            ingNo: ing.ingNo,
            quantity: ing.quantity,
            weight: ing.weight
        }));
        formData.append('ingredients', JSON.stringify(ingredientsToServer));
        
        formData.append('mainImage', mainImage);
        
        cookingSteps.forEach(step => {
            formData.append('stepDescriptions', step.description);
            formData.append('stepImages', step.image || new Blob()); 
        });
        
        try {
            setIsSubmitting(true);
            
            await api.post(`/api/community/recipe/${userNo}`, formData, { // ✨ API 엔드포인트 수정
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('레시피가 성공적으로 등록되었습니다!');
            navigate('/community/recipe'); // ✨ 목록 페이지 경로로 수정
        } catch (error) {
            console.error('레시피 등록 실패:', error);
            alert('레시피 등록에 실패했습니다. 관리자에게 문의하세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {isModalOpen && <IngredientModal onClose={() => setIsModalOpen(false)} onComplete={handleAddIngredientFromModal} />}
            <CommunityHeader />

            <div className={write.main}>
                <div className={write.container}>
                    <div className={write.header_card}>
                        🥗 레시피 작성 🥗
                    </div>

                    {/* --- 기본 정보 카드 --- */}
                    <div className={write.card}>
                        <h2>기본정보</h2>
                        <div className={write.content}>
                            <div className={write.other_card}>
                                <div id={write.title}>
                                    <span>레시피 제목</span><br />
                                    <input id={write.input} type="text" placeholder="ex) 소고기 미역국 끓이기" name="rcpName" value={rcpName} onChange={e => setRcpName(e.target.value)} />
                                </div>
                                <div id={write.title}>
                                    <span>레시피 소개</span><br />
                                    <textarea name="rcpInfo" placeholder="ex ) 이 소고기 미역국 말이죠..." value={rcpInfo} onChange={e => setRcpInfo(e.target.value)}></textarea>
                                </div>
                                <div id={write.title}>
                                    <span>태그</span><br />
                                    <input id={write.input} type="text" name="tag" placeholder="#태그 #단짠단짠" value={tag} onChange={e => setTag(e.target.value)} />
                                </div>
                                <div id={write.title}>
                                    <span>요리정보</span><br />
                                    <div className={write.info_box}>
                                        <div className={write.info}>
                                            <img src={scaleIcon} alt="조리방법"/> 조리방법
                                            <select name="rcpMthNo" value={rcpMthNo} onChange={e => setRcpMthNo(e.target.value)}>
                                                <option value="">== 선택 ==</option>
                                                {/* ✨ 여기에 key 추가 */}
                                                {methodOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                            </select>
                                        </div>
                                        <div className={write.info}>
                                            <img src={cookingIcon} alt="요리종류"/> 요리종류
                                            <select name="rcpStaNo" value={rcpStaNo} onChange={e => setRcpStaNo(e.target.value)}>
                                                <option value="">== 선택 ==</option>
                                                {/* ✨ 여기에 key 추가 */}
                                                {typeOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id={write.title}>
                                <span>대표사진</span>
                                <input type="file" accept="image/*" ref={mainImageInputRef} onChange={handleMainImageChange} style={{ display: 'none' }} />
                                <div className={write.img_holder} onClick={() => mainImageInputRef.current?.click()}>
                                    {mainImagePreview ? (
                                        <img src={mainImagePreview} alt="대표사진 미리보기" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                    ) : (
                                        '+'
                                    )}
                                </div>
                                {mainImage && <p style={{textAlign: 'center', fontSize: '14px', wordBreak: 'break-all'}}>{mainImage.name}</p>}
                            </div>
                        </div>
                    </div>

                    {/* --- 재료 정보 카드 --- */}
                    <div className={write.card}>
                        <h2>재료정보</h2>
                        <div id={write.title}>
                            <span>재료 추가</span>
                            <table id={write.ing}>
                                <thead>
                                    <tr>
                                        <th><div className={write.ing_title}><span>지우기</span><span>재료명</span><span>수량</span><span>중량(g)</span></div></th>
                                        <th><div className={write.ing_title}><span>지우기</span><span>재료명</span><span>수량</span><span>중량(g)</span></div></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: Math.ceil((ingredients.length + 1) / 2) }).map((_, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {[0, 1].map(colIndex => {
                                                const itemIndex = rowIndex * 2 + colIndex;
                                                if (itemIndex < ingredients.length) {
                                                    const ing = ingredients[itemIndex];
                                                    return (
                                                        <td key={ing.id}>
                                                            <div className={write.ing}>
                                                                <img src={minusIcon} id={write.minus} alt="삭제" onClick={() => handleRemoveIngredient(ing.id)} style={{cursor: 'pointer'}} />
                                                                <span className={write.ing_name}>{ing.name}</span>
                                                                <span>{ing.quantity}</span>
                                                                <span>{`${ing.weight}g`}</span>
                                                            </div>
                                                        </td>
                                                    );
                                                } else if (itemIndex === ingredients.length) {
                                                    return (
                                                        <td key="add-button">
                                                            <div className={write.add_ing} onClick={() => setIsModalOpen(true)} style={{cursor: 'pointer'}}>
                                                                <img src={addIcon} id={write.add} alt="추가" />
                                                            </div>
                                                        </td>
                                                    );
                                                } else {
                                                    return <td key={`empty-${colIndex}`}></td>;
                                                }
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div id={write.title}>
                            <span>영양성분 정보</span>
                            <NutrientInfo nutrients={totalNutrients} />
                        </div>
                    </div>
                    
                    {/* --- 요리 순서 카드 --- */}
                    <div className={write.card}>
                        <h2>요리순서</h2>
                        {cookingSteps.map((step, index) => (
                            <div id={write.title} key={step.id}>
                                <table id={write.cook_box}>
                                    <thead>
                                        <tr>
                                            <th>
                                                <span>step {index + 1}</span>
                                                <div id={write.icon}>
                                                    {index === cookingSteps.length - 1 && 
                                                        <img src={addIcon} id={write.add} alt="추가" onClick={handleAddCookingStep} style={{cursor: 'pointer'}}/>
                                                    }
                                                    <img src={minusIcon} id={write.minus} alt="삭제" onClick={() => handleRemoveCookingStep(step.id)} style={{cursor: 'pointer'}}/>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <textarea
                                                    name="how2cook"
                                                    id={write.how2cook}
                                                    value={step.description}
                                                    placeholder="ex) 소고기를 볶아주세요."
                                                    onChange={(e) => handleStepDescriptionChange(step.id, e.target.value)}
                                                />
                                                <input type="file" accept="image/*" onChange={(e) => handleStepImageChange(step.id, e)} style={{ display: 'none' }} id={`step-img-${step.id}`} />
                                                <label htmlFor={`step-img-${step.id}`} className={write.img_how2cook}>
                                                    {step.imagePreview ? <img src={step.imagePreview} alt="step preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : '+'}
                                                </label>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ))}
                        <button className={write.add_how2cook} onClick={handleAddCookingStep}>요리순서 추가</button>
                    </div>
                        
                    {/* --- 최종 버튼 --- */}
                    <div className={write.button_area}>
                        <button id={write.cancel} onClick={() => navigate(-1)} disabled={isSubmitting}>작성 취소</button>
                        <button id={write.complete} onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? '등록 중...' : '작성 완료'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RecipeWrite;