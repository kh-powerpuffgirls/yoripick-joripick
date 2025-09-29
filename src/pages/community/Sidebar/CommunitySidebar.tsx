import React, { useEffect, useState } from 'react';
import sidebar from'./CommunitySideber.module.css';
import {api} from '../../../api/authApi';
import type { RcpOption,IngredientOption } from '../../../type/Recipe';

// 부모에게 전달할 검색 조건 타입
interface SearchParams {
  ingredients?: string;
  rcpMthNo?: string;
  rcpStaNo?: string;
}

interface SidebarProps {
  onSearch: (params: SearchParams) => void;
  isOfficial: boolean;
}

const CommunitySidebar: React.FC<SidebarProps> = ({ onSearch, isOfficial }) => {
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
        console.error('사이드바 옵션 로딩 실패', error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (ingredientInput.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const response = await api.get('/api/ingredients/search', { params: { keyword: ingredientInput } });
        setSearchResults(response.data);
      } catch (error) {
        console.error('재료 검색 실패', error);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [ingredientInput]);

  const handleSelectIngredient = (ingredient: IngredientOption) => {
    if (!selectedIngredients.some(i => i.ingNo === ingredient.ingNo)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setIngredientInput('');
    setSearchResults([]);
  };

  const handleRemoveIngredient = (ingNo: number) => {
    setSelectedIngredients(selectedIngredients.filter(i => i.ingNo !== ingNo));
  };
  
  const handleSearch = () => {
    let ingredientsParam = '';

    if (isOfficial) {
      // 공식 레시피 페이지: 재료 이름(ingName)으로 파라미터 생성
      ingredientsParam = selectedIngredients.map(i => i.ingName).join(',');
    } else {
      // 커뮤니티 레시피 페이지: 재료 번호(ingNo)로 파라미터 생성
      ingredientsParam = selectedIngredients.map(i => i.ingNo).join(',');
    }

    onSearch({
      ingredients: selectedIngredients.map(i => i.ingName).join(','),
      rcpMthNo: rcpMthNo,
      rcpStaNo: rcpStaNo,
    });
  };

  return (
    <div className={sidebar.sidebar}>
      <h1>정렬조건</h1>
      <div id={sidebar.box}>
        <label className={sidebar.sidebar_title}>재료</label>
        <hr />
        <div className={sidebar.input_wrapper}>
          <input 
            type="text" 
            placeholder="예: 감자" 
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
          />
          {ingredientInput.length >= 1 && (
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
          <label><input type="radio" name="rcpMth" value="" onChange={(e) => setRcpMthNo(e.target.value)} defaultChecked /> 전체</label>
          {methodOptions.map(opt => (
            <label key={opt.id}><input type="radio" name="rcpMth" value={opt.id} onChange={(e) => setRcpMthNo(e.target.value)} /> {opt.name}</label>
          ))}
        </div>
      </div>
      
      <div id={sidebar.box}>
        <div className={sidebar.sidebar_title}>요리종류</div>
        <hr />
        <div className={sidebar.checkbox_group}>
          <label><input type="radio" name="rcpSta" value="" onChange={(e) => setRcpStaNo(e.target.value)} defaultChecked /> 전체</label>
          {typeOptions.map(opt => (
            <label key={opt.id}><input type="radio" name="rcpSta" value={opt.id} onChange={(e) => setRcpStaNo(e.target.value)} /> {opt.name}</label>
          ))}
        </div>
        <button className={sidebar.submit_button} onClick={handleSearch}>조회</button>
      </div>
    </div>
  );
};

export default CommunitySidebar;