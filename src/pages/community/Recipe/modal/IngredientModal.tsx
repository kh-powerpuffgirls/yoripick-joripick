import React, { useState, useEffect } from 'react';
import axios from 'axios';

import styles from './IngredientModal.module.css'; 
import closeIcon from '../../../../assets/sample/X_btn.png';

// ✨ Recipe.ts에서 수정한 타입들을 가져옵니다.
import type { 
  AddedIngredient, 
  IngredientModalProps, 
  IngredientSearchResult, 
  NutrientData 
} from '../../../../type/Recipe';

// ✨ 컴포넌트 Props 타입을 IngredientModalProps로 변경합니다.
const IngredientModal: React.FC<IngredientModalProps> = ({ onClose, onComplete }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(''); // 예: "1개", "2T"
  const [weight, setWeight] = useState('');   // g 단위 중량 (숫자)
  
  const [searchResults, setSearchResults] = useState<IngredientSearchResult[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientSearchResult | null>(null);
  
  // '재료명' input에 타이핑할 때마다 재료 검색 API 호출
  useEffect(() => {
    // 검색어가 2글자 미만이거나, 이미 선택한 재료와 이름이 같으면 API 호출 안 함
    if (name.length < 2 || (selectedIngredient && name === selectedIngredient.ing_name)) {
      setSearchResults([]);
      return;
    }

    const fetchIngredients = async () => {
      try {
        const response = await axios.get('/api/ingredients/search', { params: { keyword: name } });
        setSearchResults(response.data);
      } catch (error) {
        console.error('재료 검색에 실패했습니다.', error);
      }
    };

    // 디바운스: 0.3초 동안 추가 입력이 없으면 API 호출
    const timerId = setTimeout(() => {
      fetchIngredients();
    }, 300);

    return () => clearTimeout(timerId);
  }, [name, selectedIngredient]);

  // 검색 결과 목록에서 재료를 선택했을 때
  const handleSelectIngredient = (ing: IngredientSearchResult) => {
    setName(ing.ing_name);
    setSelectedIngredient(ing);
    setSearchResults([]); // 목록 숨기기
  };

  // '작성 완료' 버튼 클릭 시
  const handleComplete = () => {
    const weightNum = Number(weight);
    if (!selectedIngredient || !quantity || !weight || isNaN(weightNum) || weightNum <= 0) {
      alert('재료를 검색/선택하고, 올바른 수량과 중량(g)을 입력해주세요.');
      return;
    }

    // 선택된 재료의 100g당 영양소 기준, 사용자가 입력한 중량(g)으로 환산
    const calculatedNutrients: NutrientData = {
      calories: (selectedIngredient.energy / 100) * weightNum,
      carbs:    (selectedIngredient.carb / 100) * weightNum,
      protein:  (selectedIngredient.protein / 100) * weightNum,
      fat:      (selectedIngredient.fat / 100) * weightNum,
      sodium:   (selectedIngredient.sodium / 100) * weightNum,
    };
    
    // ✨ 부모에게 전달할 최종 재료 객체를 AddedIngredient 타입에 맞게 생성
    const newIngredient: AddedIngredient = {
      id: Date.now(), // 프론트엔드용 임시 ID
      ing_no: selectedIngredient.ing_no, // DB 재료 번호
      name: selectedIngredient.ing_name, // 재료명
      quantity: quantity, // 사용자가 입력한 수량 (예: "1개")
      weight: weightNum,  // 사용자가 입력한 중량 (g)
      nutrients: calculatedNutrients,
    };
    
    onComplete(newIngredient); // 완성된 객체를 부모 컴포넌트로 전달
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.head_title}>
          <span>재료 추가</span>
          <img src={closeIcon} className={styles.close} alt="닫기" onClick={onClose} />
        </div>
        <div className={styles.container}>
          <div className={styles.content}>
            <span>재료명</span>
            <div className={styles.searchInputWrapper}>
                <input
                    type="text"
                    placeholder="두 글자 이상 입력하세요"
                    value={name}
                    className={styles.input_text}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSelectedIngredient(null); // 직접 이름을 수정하면 선택 상태 초기화
                    }}
                    autoComplete="off"
                />
                {searchResults.length > 0 && (
                    <ul className={styles.dropdown}>
                    {searchResults.map(ing => (
                        <li key={ing.ing_no} onClick={() => handleSelectIngredient(ing)}>
                            {ing.ing_name}
                        </li>
                    ))}
                    </ul>
                )}
            </div>
          </div>
          <div className={styles.content}>
            <span>수량</span>
            <input
                type="text"
                placeholder="예: 1개, 반 봉지"
                value={quantity}
                className={styles.input_text}
                onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className={styles.content}>
            <span>중량(g)</span>
            <input
                type="number"
                placeholder="숫자만 입력 (단위: g)"
                value={weight}
                className={styles.input_text}
                onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className={styles.btn}>
            <button className={styles.cancel} onClick={onClose}>작성 취소</button>
            <button className={styles.complete} onClick={handleComplete}>작성 완료</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientModal;