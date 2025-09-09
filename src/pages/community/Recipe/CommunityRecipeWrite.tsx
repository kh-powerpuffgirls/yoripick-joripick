import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

// ==========================================================
// 타입 정의
// ==========================================================
// NutrientInfo 컴포넌트로 전달될 타입
interface NutrientData {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sodium: number;
}
// 재료 목록 State에서 사용할 타입
interface Ingredient {
  id: number;
  name: string;
  quantity: string; // 예: "100g (1개)"
  nutrients: NutrientData; // 개별 재료의 환산된 영양소 정보
}
// 요리 순서 State에서 사용할 타입
interface CookingStep {
  id: number;
  description: string;
  image: File | null;
  imagePreview?: string;
}
// 드롭다운 옵션 State에서 사용할 타입
interface RcpOption {
  id: number;
  name: string;
}

// ==========================================================
// 컴포넌트 시작
// ==========================================================
const CommunityRecipeWrite: React.FC = () => {
  const navigate = useNavigate();

  // --- State 관리 ---

  // 1. 기본 정보
  const [title, setTitle] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [tags, setTags] = useState('');
  const [cookingMethod, setCookingMethod] = useState('');
  const [recipeType, setRecipeType] = useState('');

  // 2. 대표 사진
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);

  // 3. 재료 정보 및 모달
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 4. 총 영양 정보 (NutrientInfo 자식 컴포넌트로 전달)
  const [totalNutrients, setTotalNutrients] = useState<NutrientData>({
    calories: 0, carbs: 0, protein: 0, fat: 0, sodium: 0
  });

  // 5. 요리 순서
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([
    { id: Date.now(), description: '', image: null }
  ]);
  
  // 6. 드롭다운 선택지 목록
  const [methodOptions, setMethodOptions] = useState<RcpOption[]>([]);
  const [typeOptions, setTypeOptions] = useState<RcpOption[]>([]);


  // --- useEffect Hooks ---

  // 컴포넌트가 처음 렌더링될 때 요리 방법/종류 목록을 서버에서 가져옴
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [methodRes, typeRes] = await Promise.all([
          axios.get('/api/options/methods'),
          axios.get('/api/options/situations')
        ]);
        // DTO의 snake_case를 camelCase에 맞게 매핑
        setMethodOptions(methodRes.data.map((item: any) => ({ id: item.rcp_mth_no, name: item.rcp_method })));
        setTypeOptions(typeRes.data.map((item: any) => ({ id: item.rcp_sta_no, name: item.rcp_situation })));
      } catch (error) {
        console.error('요리 옵션 정보를 불러오는 데 실패했습니다.', error);
        alert('요리 옵션 정보를 불러올 수 없습니다.');
      }
    };
    fetchOptions();
  }, []);

  // `ingredients` 배열이 변경될 때마다 총 영양성분을 다시 계산
  useEffect(() => {
    const totals = ingredients.reduce((acc, curr) => {
      acc.calories += curr.nutrients.calories;
      acc.carbs += curr.nutrients.carbs;
      acc.protein += curr.nutrients.protein;
      acc.fat += curr.nutrients.fat;
      acc.sodium += curr.nutrients.sodium;
      return acc;
    }, { calories: 0, carbs: 0, protein: 0, fat: 0, sodium: 0 });

    // 소수점 첫째 자리까지만 표시
    for (const key in totals) {
      totals[key as keyof NutrientData] = parseFloat(totals[key as keyof NutrientData].toFixed(1));
    }

    setTotalNutrients(totals);
  }, [ingredients]);


  // --- 이벤트 핸들러 함수들 ---

  // 대표사진 추가 핸들러
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImage(file);
      const previewUrl = URL.createObjectURL(file);
      setMainImagePreview(previewUrl);
    }
  };

  // 모달에서 재료 추가를 완료했을 때 실행되는 콜백 함수
  const handleAddIngredientFromModal = (newIngredient: Ingredient) => {
    setIngredients(prevIngredients => [...prevIngredients, newIngredient]);
    setIsModalOpen(false); // 모달 닫기
  };

  // 재료 "지우기" 버튼 핸들러
  const handleRemoveIngredient = (idToRemove: number) => {
    setIngredients(ingredients.filter(ing => ing.id !== idToRemove));
  };

  // "요리순서 추가" 버튼 핸들러
  const handleAddCookingStep = () => {
    if (cookingSteps.length >= 20) {
      alert("요리 순서는 최대 20개까지 추가할 수 있습니다.");
      return;
    }
    const newStep: CookingStep = { id: Date.now(), description: '', image: null };
    setCookingSteps([...cookingSteps, newStep]);
  };

  // 요리순서 "삭제" 버튼 핸들러
  const handleRemoveCookingStep = (idToRemove: number) => {
    if (cookingSteps.length > 1) {
      setCookingSteps(cookingSteps.filter(step => step.id !== idToRemove));
    } else {
      alert("요리 순서는 최소 1개 이상이어야 합니다.");
    }
  };

  // 요리순서 설명 변경 핸들러
  const handleStepDescriptionChange = (id: number, value: string) => {
    setCookingSteps(steps => steps.map(step =>
      step.id === id ? { ...step, description: value } : step
    ));
  };

  // 요리순서 이미지 추가 핸들러
  const handleStepImageChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setCookingSteps(steps => steps.map(step =>
        step.id === id ? { ...step, image: file, imagePreview: previewUrl } : step
      ));
    }
  };

  // "작성 완료" 버튼 핸들러
  const handleSubmit = async () => {
    // 유효성 검사
    if (!title || !introduction || !cookingMethod || !recipeType || !mainImage) {
        alert('기본정보(제목, 소개, 요리정보, 대표사진)는 모두 필수 항목입니다.');
        return;
    }

    const formData = new FormData();
    // 1. 텍스트 데이터 추가
    formData.append('rcpName', title);
    formData.append('rcpInfo', introduction);
    formData.append('tag', tags);
    formData.append('rcpMthNo', cookingMethod);
    formData.append('rcpStaNo', recipeType);
    
    // 2. 재료 정보 (서버에서 파싱하기 쉽도록 JSON 문자열로 변환)
    const ingredientData = ingredients.map(ing => ({ name: ing.name, quantity: ing.quantity }));
    formData.append('ingredients', JSON.stringify(ingredientData));
    
    // 3. 대표 이미지 파일 추가
    formData.append('mainImage', mainImage);
    
    // 4. 요리 순서 데이터 및 파일 추가
    cookingSteps.forEach(step => {
        formData.append('stepDescriptions', step.description);
        // 이미지가 없는 경우를 대비해 빈 Blob을 보내거나 서버에서 null 처리를 해야 함
        if (step.image) {
            formData.append('stepImages', step.image);
        } else {
            formData.append('stepImages', new Blob()); // 빈 파일로 전송
        }
    });
    
    try {
        await axios.post('/api/community/recipe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('레시피가 성공적으로 등록되었습니다!');
        navigate('/community/recipe'); // 목록 페이지로 이동
    } catch (error) {
        console.error('레시피 등록 실패:', error);
        alert('레시피 등록에 실패했습니다. 서버 로그를 확인해주세요.');
    }
  };


  // --- JSX 렌더링 ---
  return (
    <>
      {/* isModalOpen이 true일 때만 모달 렌더링 */}
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
                <input id='input' type="text" placeholder="ex) 소고기 미역국 끓이기" name="title" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div id={write.title}>
                <span>레시피 소개</span><br />
                <textarea name="content" placeholder="ex ) 이 소고기 미역국 말이죠..." value={introduction} onChange={e => setIntroduction(e.target.value)}></textarea>
              </div>
               <div id={write.title}>
                  <span>태그</span><br />
                  <input id='input' type="text" name="tag" placeholder="#태그 #단짠단짠" value={tags} onChange={e => setTags(e.target.value)} />
              </div>
              <div id={write.title}>
                <span>요리정보</span><br />
                <div className={write.info_box}>
                  <div className={write.info}>
                    <img src={scaleIcon} alt="조리방법"/> 조리방법
                    <select name="method" value={cookingMethod} onChange={e => setCookingMethod(e.target.value)}>
                      <option value="">== 선택 ==</option>
                      {methodOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </select>
                  </div>
                  <div className={write.info}>
                    <img src={cookingIcon} alt="요리종류"/> 요리종류
                    <select name="kind" value={recipeType} onChange={e => setRecipeType(e.target.value)}>
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

        {/* --- 재료 정보 카드 --- */}
        <div className={write.card}>
          <h2>재료정보</h2>
          <div id={write.title}>
            <span>재료 추가</span>
            <table id={write.ing}>
              <thead>
                  <tr>
                      <th><div className={write.ing_title}><span>지우기</span><span>재료명</span><span>수량</span><span>중량</span></div></th>
                      <th><div className={write.ing_title}><span>지우기</span><span>재료명</span><span>수량</span><span>중량</span></div></th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      {ingredients.map(ing => (
                          <td key={ing.id}>
                              <div className={write.ing}>
                                  <img src={minusIcon} id={write.minus} alt="삭제" onClick={() => handleRemoveIngredient(ing.id)} style={{cursor: 'pointer'}} />
                                  <span>{ing.name}</span>
                                  <span>{ing.quantity}</span>
                              </div>
                          </td>
                      ))}
                      <td>
                          <div className={write.add_ing} onClick={() => setIsModalOpen(true)} style={{cursor: 'pointer'}}>
                              <img src={addIcon} id={write.add} alt="추가" />
                          </div>
                      </td>
                  </tr>
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
                          <img src={addIcon} id={write.add} alt="추가" onClick={handleAddCookingStep} style={{cursor: 'pointer'}}/>
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
                          placeholder="ex) 소고기 "
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
          <button id={write.cancel} onClick={() => navigate(-1)}>작성 취소</button>
          <button id={write.complete} onClick={handleSubmit}>작성 완료</button>
        </div>
      </div>

      </div>
    </>
  );
};

export default CommunityRecipeWrite;