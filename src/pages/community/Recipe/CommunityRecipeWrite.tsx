import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import write from './CommunityRecipeWrite.module.css';

// 자식 컴포넌트 import
import NutrientInfo from './NutrientInfo';

// 아이콘 이미지 import
import scaleIcon from '../../../assets/sample/저울아이콘.png';
import cookingIcon from '../../../assets/sample/요리아이콘.png';
import minusIcon from '../../../assets/sample/minus_icon.png';
import addIcon from '../../../assets/sample/add_icon.png';

// 타입 정의
interface Ingredient {
  id: number;
  name: string;
  quantity: string;
}

interface CookingStep {
  id: number;
  description: string;
  image: File | null;
  imagePreview?: string;
}

const CommunityRecipeWrite: React.FC = () => {
  const navigate = useNavigate();

  // 1. 기본 정보 State
  const [title, setTitle] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [tags, setTags] = useState('');
  const [cookingMethod, setCookingMethod] = useState('');
  const [recipeType, setRecipeType] = useState('');

  // 2. 대표 사진 State
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);

  // 3. 재료 정보 State
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // 4. 영양 정보 State (NutrientInfo 자식 컴포넌트로 전달)
  const [nutrients, setNutrients] = useState({
    carbs: 18, protein: 10.7, fat: 1.3, sodium: 510, calories: 108
  });

  // 5. 요리 순서 State
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>([
    { id: 1, description: 'ex) 소고기는 핏물을 빼어 양념에 재워둔다.', image: null }
  ]);
  const stepImageInputRef = useRef<HTMLInputElement>(null);

  // --- 이벤트 핸들러 함수들 ---

  // ⭐️ 대표사진 추가 핸들러
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImage(file);
      // 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(file);
      setMainImagePreview(previewUrl);
    }
  };

  // ⭐️ "재료 추가" 버튼 핸들러 (실제로는 모달을 띄워야 함)
  const handleAddIngredient = () => {
    // 임시로 하드코딩된 재료를 추가. 추후 모달에서 입력받은 값으로 대체.
    const newIngredient: Ingredient = {
      id: Date.now(), // 고유 ID 생성
      name: `새 재료 ${ingredients.length + 1}`,
      quantity: '1개'
    };
    setIngredients([...ingredients, newIngredient]);
  };
  
  // ⭐️ 재료 "지우기" 버튼 핸들러
  const handleRemoveIngredient = (idToRemove: number) => {
    setIngredients(ingredients.filter(ing => ing.id !== idToRemove));
  };
  
  // ⭐️ "요리순서 추가" 버튼 핸들러
  const handleAddCookingStep = () => {
    const newStep: CookingStep = {
      id: Date.now(),
      description: '',
      image: null
    };
    setCookingSteps([...cookingSteps, newStep]);
  };
  
  // ⭐️ 요리순서 "삭제" 버튼 핸들러
  const handleRemoveCookingStep = (idToRemove: number) => {
    if (cookingSteps.length > 1) { // 최소 1개는 남기도록
      setCookingSteps(cookingSteps.filter(step => step.id !== idToRemove));
    } else {
      alert("요리 순서는 최소 1개 이상이어야 합니다.");
    }
  };
  
  // ⭐️ 요리순서 설명 변경 핸들러
  const handleStepDescriptionChange = (id: number, value: string) => {
    setCookingSteps(steps => steps.map(step =>
      step.id === id ? { ...step, description: value } : step
    ));
  };
  
  // ⭐️ 요리순서 이미지 추가 핸들러
  const handleStepImageChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setCookingSteps(steps => steps.map(step =>
        step.id === id ? { ...step, image: file, imagePreview: previewUrl } : step
      ));
    }
  };


  // ⭐️ "작성 완료" 버튼 핸들러
  const handleSubmit = async () => {
    // FormData 객체를 사용하여 텍스트 데이터와 파일 데이터를 함께 보낼 준비
    const formData = new FormData();
    formData.append('title', title);
    formData.append('introduction', introduction);
    formData.append('tags', tags);
    // ... 다른 모든 텍스트/숫자 데이터 append
    formData.append('ingredients', JSON.stringify(ingredients)); // 배열/객체는 JSON 문자열로 변환
    
    if(mainImage) {
        formData.append('mainImage', mainImage);
    }

    cookingSteps.forEach((step, index) => {
        formData.append(`cookingSteps[${index}].description`, step.description);
        if(step.image) {
            formData.append(`cookingSteps[${index}].image`, step.image);
        }
    });
    
    try {
        // 백엔드 API 주소로 POST 요청
        // const response = await axios.post('/api/community/recipe', formData, {
        //     headers: { 'Content-Type': 'multipart/form-data' }
        // });
        // console.log('서버 응답:', response.data);
        alert('레시피가 성공적으로 등록되었습니다!');
        // navigate('/community/recipe'); // 목록 페이지로 이동
    } catch (error) {
        console.error('레시피 등록 실패:', error);
        alert('레시피 등록에 실패했습니다.');
    }
  };


  return (
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
              <input type="text" name="title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div id={write.title}>
              <span>레시피 소개</span><br />
              <textarea name="content" value={introduction} onChange={e => setIntroduction(e.target.value)}></textarea>
            </div>
             <div id={write.title}>
                <span>태그</span><br />
                <input type="text" name="tag" placeholder="#태그 #단짠단짠" value={tags} onChange={e => setTags(e.target.value)} />
            </div>
            <div id={write.title}>
              <span>요리정보</span><br />
              <div className={write.info_box}>
                <div className={write.info}>
                  <img src={scaleIcon} alt="조리방법"/> 조리방법
                  <select name="method" value={cookingMethod} onChange={e => setCookingMethod(e.target.value)}>
                    <option value="">== 선택 ==</option>
                    <option value="1">굽기</option>
                    <option value="2">부침</option>
                    <option value="3">찜</option>
                  </select>
                </div>
                <div className={write.info}>
                  <img src={cookingIcon} alt="요리종류"/> 요리종류
                  <select name="kind" value={recipeType} onChange={e => setRecipeType(e.target.value)}>
                    <option value="">== 선택 ==</option>
                    <option value="1">반찬</option>
                    <option value="2">밥/죽/떡</option>
                    <option value="3">국/탕</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div id={write.title}>
            <span>대표사진</span>
            {/* ⭐️ 숨겨진 input을 클릭하도록 연결 */}
            <input type="file" accept="image/*" ref={mainImageInputRef} onChange={handleMainImageChange} style={{ display: 'none' }} />
            <div className={write.img_holder} onClick={() => mainImageInputRef.current?.click()}>
                {mainImagePreview ? (
                    <img src={mainImagePreview} alt="대표사진 미리보기" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                    '+'
                )}
            </div>
            {mainImage && <p style={{textAlign: 'center', fontSize: '14px'}}>{mainImage.name}</p>}
          </div>
        </div>
      </div>

      {/* --- 재료 정보 카드 --- */}
      <div className={write.card}>
        <h2>재료정보</h2>
        <div id={write.title}>
          <span>재료 (클릭하여 추가)</span>
          <table id={write.ing}>
            <thead>
                <tr>
                    <th><div className={write.ing_title}><span>지우기</span><span>재료명</span><span>수량</span></div></th>
                    <th><div className={write.ing_title}><span>지우기</span><span>재료명</span><span>수량</span></div></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    {/* ⭐️ 재료 목록을 동적으로 렌더링 */}
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
                        {/* ⭐️ 재료 추가 버튼 */}
                        <div className={write.add_ing} onClick={handleAddIngredient} style={{cursor: 'pointer'}}>
                            <img src={addIcon} id={write.add} alt="추가" />
                        </div>
                    </td>
                </tr>
            </tbody>
          </table>
        </div>
        <div id={write.title}>
          <span>영양성분 정보</span>
          {/* ⭐️ 분리된 NutrientInfo 컴포넌트 사용 */}
          <NutrientInfo nutrients={nutrients} />
        </div>
      </div>

      {/* --- 요리 순서 카드 --- */}
      <div className={write.card}>
        <h2>요리순서</h2>
        {/* ⭐️ 요리 순서 목록을 동적으로 렌더링 */}
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
  );
};

export default CommunityRecipeWrite;
