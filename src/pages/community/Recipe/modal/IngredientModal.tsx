import React, { useState, useEffect } from 'react';
import { api } from '../../../../api/authApi';

import styles from './IngredientModal.module.css'; 
import closeIcon from '../../../../assets/sample/X_btn.png';

// ✨ Recipe.ts에서 올바른 타입들을 가져오는지 확인하세요.
import type { 
  AddedIngredient, 
  IngredientModalProps, 
  IngredientSearchResult, 
  NutrientData 
} from '../../../../type/Recipe';

// ✨ 컴포넌트의 Props 타입을 IngredientModalProps로 정확히 지정해야 합니다.
const IngredientModal: React.FC<IngredientModalProps> = ({ onClose, onComplete }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [weight, setWeight] = useState('');
  
  const [searchResults, setSearchResults] = useState<IngredientSearchResult[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientSearchResult | null>(null);
  
  useEffect(() => {
    // ✨ name이 null 또는 undefined가 되는 것을 방지
    const currentName = name || ''; 
    if (currentName.length < 1 || (selectedIngredient && currentName === selectedIngredient.ingName)) {
      setSearchResults([]);
      return;
    }

    const fetchIngredients = async () => {
      try {
        const response = await api.get('/api/ingredients/search', { params: { keyword: currentName } });
        const results = Array.isArray(response.data) ? response.data : [];
        setSearchResults(results);
      } catch (error) {
        console.error('재료 검색에 실패했습니다.', error);
        setSearchResults([]);
      }
    };

    const timerId = setTimeout(() => {
      fetchIngredients();
    }, 300);

    return () => clearTimeout(timerId);
  }, [name, selectedIngredient]);

  const handleSelectIngredient = (ing: IngredientSearchResult) => {
    console.log('선택된 재료 (ing):', ing);
    // ✨ ing 객체에서 카멜케이스(ingName)로 값을 가져와 setName에 설정
    setName(ing.ingName); 
    setSelectedIngredient(ing);
    setSearchResults([]);
  };

  const handleComplete = () => {
    const weightNum = Number(weight);
    if (!selectedIngredient || !quantity || !weight || isNaN(weightNum) || weightNum <= 0) {
      alert('재료를 검색/선택하고, 올바른 수량과 중량(g)을 입력해주세요.');
      return;
    }

    const calculatedNutrients: NutrientData = {
      calories: (selectedIngredient.energy / 100) * weightNum,
      carbs:    (selectedIngredient.carb / 100) * weightNum,
      protein:  (selectedIngredient.protein / 100) * weightNum,
      fat:      (selectedIngredient.fat / 100) * weightNum,
      sodium:   (selectedIngredient.sodium / 100) * weightNum,
    };
    
    const newIngredient: AddedIngredient = {
      id: Date.now(),
      ingNo: selectedIngredient.ingNo, // ✨ 카멜케이스(ingNo) 사용
      name: selectedIngredient.ingName, // ✨ 카멜케이스(ingName) 사용
      quantity: quantity,
      weight: weightNum,
      nutrients: calculatedNutrients,
    };
    
    onComplete([newIngredient]);
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
                    placeholder="한글자 이상 입력하세요"
                    value={name} // ✨ name이 string임을 보장
                    className={styles.input_text}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSelectedIngredient(null);
                    }}
                    autoComplete="off"
                />
                {searchResults.length > 0 && (
                    <ul className={styles.dropdown}>
                    {searchResults.map(ing => (
                        <li key={ing.ingNo} onClick={() => handleSelectIngredient(ing)}>
                            {/* ✨ 카멜케이스(ingName)로 이름 표시 */}
                            {ing.ingName} 
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