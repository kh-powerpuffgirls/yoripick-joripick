import React, { useEffect, useState } from 'react';
import sidebar from'./CommunitySideber.module.css';
import axios from 'axios';

// 타입 정의
interface RcpOption {
  id: number;
  name: string;
}
interface Ingredient {
  ingNo: number;
  ingName: string;
}
// 부모에게 전달할 검색 조건의 타입을 정의합니다.
interface SearchParams {
  ingredients: string[]; // 재료를 배열로 관리
  rcp_mth_no: string;
  rcp_sta_no: string;
}

// 부모로부터 받을 props의 타입을 정의합니다.
interface SidebarProps {
  onSearch: (params: SearchParams) => void;
}
const CommunitySidebar: React.FC<SidebarProps> = ({ onSearch }) => {
  // 1. 필터 선택 값 State
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [rcpMth, setRcpMth] = useState('');
  const [rcpSta, setRcpSta] = useState('');

  // 2. 재료 검색 관련 State
  const [ingredientInput, setIngredientInput] = useState('');
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);

  // 3. DB에서 가져온 옵션 목록 State
  const [methodOptions, setMethodOptions] = useState<RcpOption[]>([]);
  const [typeOptions, setTypeOptions] = useState<RcpOption[]>([]);

  // 컴포넌트 마운트 시 요리 방법/종류 데이터 불러오기
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [methodRes, typeRes] = await Promise.all([
          axios.get('/api/options/methods'),
          axios.get('/api/options/situations')
        ]);
        setMethodOptions(methodRes.data.map((item: any) => ({ id: item.rcpMthNo, name: item.rcpMethod })));
        setTypeOptions(typeRes.data.map((item: any) => ({ id: item.rcpStaNo, name: item.rcpSituation })));
      } catch (error) {
        console.error('사이드바 옵션 로딩 실패', error);
      }
    };
    fetchOptions();
  }, []);

  // 재료 입력 시 API 호출 (디바운싱)
  useEffect(() => {
    if (ingredientInput.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const response = await axios.get('/api/ingredients/search', { params: { keyword: ingredientInput } });
        setSearchResults(response.data);
      } catch (error) {
        console.error('재료 검색 실패', error);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [ingredientInput]);

  // 재료 드롭다운에서 항목 선택 시
  const handleSelectIngredient = (ingredient: Ingredient) => {
    // 중복 추가 방지
    if (!selectedIngredients.some(i => i.ingNo === ingredient.ingNo)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setIngredientInput('');
    setSearchResults([]);
  };

  // 추가된 재료 태그 삭제 시
  const handleRemoveIngredient = (ingNo: number) => {
    setSelectedIngredients(selectedIngredients.filter(i => i.ingNo !== ingNo));
  };
  
  // '조회' 버튼 클릭 시
  const handleSearch = () => {
    onSearch({
      ingredients: selectedIngredients.map(i => i.ingName), // 이름 배열로 전달
      rcp_mth_no: rcpMth,
      rcp_sta_no: rcpSta,
    });
  };

   return (
    <div className={sidebar.sidebar}>
      <h1>정렬조건</h1>
      <div id={sidebar.box}>
        <label className={sidebar.sidebar_title}>재료</label>
        <div className={sidebar.input_wrapper}>
          <input 
            type="text" 
            placeholder="예: 감자" 
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
          />
          {ingredientInput.length >= 2 && (
            <ul className={sidebar.dropdown}>
              {searchResults.length > 0 ? (
                searchResults.map(ing => (
                  <li key={ing.ingNo} onClick={() => handleSelectIngredient(ing)}>
                    {ing.ingName}
                  </li>
                ))
              ) : (
                <li className={sidebar.no_result}>검색 결과가 없습니다.</li>
              )}
            </ul>
          )}
        </div>
        <div className={sidebar.tag_box}>
          {selectedIngredients.map(ing => (
            <span key={ing.ingNo} className={sidebar.tag}>
              {ing.ingName}
              <button onClick={() => handleRemoveIngredient(ing.ingNo)}>&times;</button>
            </span>
          ))}
        </div>
      </div>

      <div id={sidebar.box}>
        <div className={sidebar.sidebar_title}>요리방법</div>
        <hr />
        <div className={sidebar.checkbox_group}>
          <label><input type="radio" name="rcpMth" value="" onChange={(e) => setRcpMth(e.target.value)} defaultChecked /> 전체</label>
          {methodOptions.map(opt => (
            <label key={opt.id}><input type="radio" name="rcpMth" value={opt.id} onChange={(e) => setRcpMth(e.target.value)} /> {opt.name}</label>
          ))}
        </div>
      </div>
      
      <div id={sidebar.box}>
        <div className={sidebar.sidebar_title}>요리종류</div>
        <hr />
        <div className={sidebar.checkbox_group}>
          <label><input type="radio" name="rcpSta" value="" onChange={(e) => setRcpSta(e.target.value)} defaultChecked /> 전체</label>
          {typeOptions.map(opt => (
            <label key={opt.id}><input type="radio" name="rcpSta" value={opt.id} onChange={(e) => setRcpSta(e.target.value)} /> {opt.name}</label>
          ))}
        </div>
        <button className={sidebar.submit_button} onClick={handleSearch}>조회</button>
      </div>
    </div>
  );
};


export default CommunitySidebar;