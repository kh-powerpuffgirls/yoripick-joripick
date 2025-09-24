import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../../api/authApi';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';

// CSS 모듈 및 자식 컴포넌트 import
import write from './CommunityRecipeWrite.module.css';
import NutrientInfo from './NutrientInfo';
import IngredientModal from './modal/IngredientModal';
import CommunityHeader from '../Header/CommunityHeader';

// 아이콘 이미지 import
import scaleIcon from '../../../assets/sample/저울아이콘.png';
import cookingIcon from '../../../assets/sample/요리아이콘.png';
import minusIcon from '../../../assets/sample/minus_icon.png';
import addIcon from '../../../assets/sample/add_icon.png';

interface SelectOption {
  id: number;
  name: string;
}
interface AddedIngredient {
  id: number;
  ingNo: number;
  name: string;
  quantity: string;
  weight: number;
  nutrients?: NutrientData; // 영양소 계산을 위한 상세 정보
}
interface NutrientData {
  calories: number; carbs: number; protein: number; fat: number; sodium: number;
}
interface CookingStepForForm {
  id: number;
  description: string;
  image: File | null;
  imagePreview?: string;
}

const RecipeEditPage: React.FC = () => {
    const { rcpNo } = useParams<{ rcpNo: string }>();
    const navigate = useNavigate();
    const loginUserNo = useSelector((state: RootState) => state.auth.user?.userNo);

    // --- State 관리 ---
    const [rcpName, setRcpName] = useState('');
    const [rcpInfo, setRcpInfo] = useState('');
    const [tag, setTag] = useState('');
    const [rcpMthNo, setRcpMthNo] = useState('');
    const [rcpStaNo, setRcpStaNo] = useState('');
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const [ingredients, setIngredients] = useState<AddedIngredient[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalNutrients, setTotalNutrients] = useState<NutrientData>({ calories: 0, carbs: 0, protein: 0, fat: 0, sodium: 0 });
    const [cookingSteps, setCookingSteps] = useState<CookingStepForForm[]>([{ id: Date.now(), description: '', image: null }]);
    const [methodOptions, setMethodOptions] = useState<SelectOption[]>([]);
    const [typeOptions, setTypeOptions] = useState<SelectOption[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    

    // --- 페이지 로드 시 기존 데이터를 불러오는 로직 ---
    useEffect(() => {
        const fetchRecipeData = async () => {
        try {
            if (!rcpNo) return;
            const response = await api.get(`/api/community/recipe/${rcpNo}`);
            const data = response.data;

            console.log("===== [1] 백엔드로부터 받은 원본 재료 목록 =====");
            console.log(data.ingredients);
            
            // 불러온 데이터로 각 state를 업데이트합니다.
            setRcpName(data.rcpName);
            setRcpInfo(data.rcpInfo);
            setTag(data.tag || '');
            setMainImagePreview(data.mainImage); // 기존 이미지 URL로 미리보기 설정

            setRcpMthNo(String(data.rcpMethodId || ''));
            setRcpStaNo(String(data.rcpSituationId || ''));

            // 재료 목록 변환 (id 추가)
            const formattedIngredients = data.ingredients.map((ing: any, index: number) => ({
                id: Date.now() + index, // 고유 key를 위한 id
                ingNo: ing.ingNo,
                name: ing.ingName,
                quantity: ing.quantity,
                weight: ing.weight,
                nutrients: ing.nutrients // 백엔드가 보내주는 상세 영양 정보
            }));
            setIngredients(formattedIngredients);

            // 요리 순서 목록 변환 (id 및 imagePreview 추가)
            const formattedSteps = data.steps.map((step: any, index: number) => ({
                id: Date.now() + index,
                description: step.description,
                image: null,
                imagePreview: step.serverName // 기존 이미지 URL
            }));
            setCookingSteps(formattedSteps.length > 0 ? formattedSteps : [{ id: Date.now(), description: '', image: null }]);

            } catch (error) {
                console.error("레시피 데이터 로딩 실패:", error);
                alert("데이터를 불러오는 데 실패했습니다.");
            }
        };
        
        // 요리 방법/종류 옵션도 불러옵니다.
        const fetchOptions = async () => {
            try {
                const [methodsRes, typesRes] = await Promise.all([
                    api.get('/api/options/methods'),
                    api.get('/api/options/situations')
                ]);
                setMethodOptions(methodsRes.data.map((m: any) => ({ id: m.rcpMthNo, name: m.rcpMethod })));
                setTypeOptions(typesRes.data.map((t: any) => ({ id: t.rcpStaNo, name: t.rcpSituation })));
            } catch (error) {
                console.error("옵션 로딩 실패:", error);
            }
        };

        fetchRecipeData();
        fetchOptions();
    }, [rcpNo]);
    
     useEffect(() => {
        const totals: NutrientData = ingredients.reduce((acc, curr) => {
            if (curr.nutrients) {
                const ratio = curr.weight / 100.0;
                acc.calories += (curr.nutrients.calories || 0) * ratio;
                acc.carbs    += (curr.nutrients.carbs || 0) * ratio;
                acc.protein  += (curr.nutrients.protein || 0) * ratio;
                acc.fat      += (curr.nutrients.fat || 0) * ratio;
                acc.sodium   += (curr.nutrients.sodium || 0) * ratio;
            }
            return acc;
        }, { calories: 0, carbs: 0, protein: 0, fat: 0, sodium: 0 });

        // 소수점 둘째 자리까지 반올림
        for (const key in totals) {
        const typedKey = key as keyof NutrientData;
        totals[typedKey] = parseFloat(totals[typedKey].toFixed(2));
        }
        setTotalNutrients(totals);
    }, [ingredients]);

    // 대표 이미지 변경 핸들러
    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setMainImage(file);
        if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
        setMainImagePreview(URL.createObjectURL(file));
        }
    };

    // 재료 추가 모달에서 완료 시 실행
    const handleAddIngredientFromModal = (newIngredients: Omit<AddedIngredient, 'id'>[]) => {
        const formatted = newIngredients.map(ing => ({ ...ing, id: Date.now() + Math.random() }));
        setIngredients(prev => [...prev, ...formatted]);
        setIsModalOpen(false);
    };

    // 재료삭제
    const handleRemoveIngredient = (idToRemove: number) => {
        setIngredients(ingredients.filter(ing => ing.id !== idToRemove));
    };

    // 요리순서 추가
    const handleAddCookingStep = () => {
        if (cookingSteps.length >= 20) {
            alert("요리 순서는 최대 20개까지 추가할 수 있습니다.");
            return;
        }
        setCookingSteps(prev => [...prev, { id: Date.now(), description: '', image: null }]);
    };
    
     // 요리 순서 삭제
    const handleRemoveCookingStep = (idToRemove: number) => {
        if (cookingSteps.length > 1) {
        setCookingSteps(prev => prev.filter(step => step.id !== idToRemove));
        } else {
        alert('요리 순서는 최소 1개 이상이어야 합니다.');
        }
    };
    
    // 요리 순서 설명 변경
    const handleStepDescriptionChange = (id: number, value: string) => {
        setCookingSteps(prev => prev.map(step => step.id === id ? { ...step, description: value } : step));
    };

    // 요리 순서 이미지 변경
    const handleStepImageChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setCookingSteps(prev => prev.map(step => {
            if (step.id === id) {
            if (step.imagePreview && step.imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(step.imagePreview);
            }
            return { ...step, image: file, imagePreview: URL.createObjectURL(file) };
            }
            return step;
        }));
        }
    };

    const handleSubmit = async () => {
        // 유효성 검사 로직

        if (!rcpName.trim()) {
            alert('레시피 제목을 입력해주세요.');
            return;
        }
        if (!rcpInfo.trim()) {
            alert('레시피 소개를 입력해주세요.');
            return;
        }
        if (!rcpMthNo || !rcpStaNo) {
            alert('요리정보(조리방법, 요리종류)를 모두 선택해주세요.');
            return;
        }
        if (ingredients.length === 0) {
            alert('재료를 1개 이상 추가해주세요.');
            return;
        }
        if (cookingSteps.some(step => !step.description.trim())) {
            alert('요리 순서의 설명을 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('rcpName', rcpName);
        formData.append('rcpInfo', rcpInfo);
        formData.append('tag', tag);
        formData.append('rcpMthNo', rcpMthNo);
        formData.append('rcpStaNo', rcpStaNo);
        if (mainImage) formData.append('mainImage', mainImage);

        const ingredientsData = ingredients.map(({ ingNo, quantity, weight }) => ({ ingNo, quantity, weight }));
        formData.append('ingredients', JSON.stringify(ingredientsData));

        console.log("===== [2] 서버로 전송될 최종 재료 데이터 =====");
        console.log(ingredientsData);

        cookingSteps.forEach((step, index) => {
        formData.append(`stepDescriptions[${index}]`, step.description);
        if (step.image) {
            formData.append(`stepImages`, step.image);
        }
        });

        try {
        await api.put(`/api/community/recipe/${rcpNo}/${loginUserNo}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('레시피가 수정되었습니다.');
        navigate(`/community/recipe/${rcpNo}`);
        } catch (error) {
        console.error("수정 실패:", error);
        alert('수정에 실패했습니다.');
        } finally {
        setIsSubmitting(false);
        }
    };
    
    return (
        <>
            {/* --- 1. 재료 추가 모달 (isModalOpen이 true일 때만 표시) --- */}
            {isModalOpen && <IngredientModal onClose={() => setIsModalOpen(false)} onComplete={handleAddIngredientFromModal} />}
            
            <CommunityHeader />

            <div className={write.main}>
                <div className={write.container}>
                <div className={write.header_card}>
                    🥗 레시피 수정 🥗
                </div>

                {/* --- 2. 기본 정보 카드 --- */}
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
                                {methodOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                            </select>
                            </div>
                            <div className={write.info}>
                            <img src={cookingIcon} alt="요리종류"/> 요리종류
                            <select name="rcpStaNo" value={rcpStaNo} onChange={e => setRcpStaNo(e.target.value)}>
                                <option value="">== 선택 ==</option>
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

                {/* --- 3. 재료 정보 카드 --- */}
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
                
                {/* --- 4. 요리 순서 카드 --- */}
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
                </div>
                    
                {/* --- 5. 최종 버튼 --- */}
                <div className={write.button_area}>
                    <button id={write.cancel} onClick={() => navigate(-1)} disabled={isSubmitting}>작성 취소</button>
                    <button id={write.complete} onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? '수정 중...' : '수정 완료'}
                    </button>
                </div>
                </div>
            </div>
        </>
    );
};

export default RecipeEditPage;