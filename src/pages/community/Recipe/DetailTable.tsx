import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { RecipeDetail } from '../../../type/Recipe';
import styles from './DetailTable.module.css';
import type { RootState } from '../../../store/store';

// 아이콘 import
import scaleIcon from '../../../assets/sample/저울아이콘.png';
import hourglassIcon from '../../../assets/sample/모래시계아이콘.png';
import cookingIcon from '../../../assets/sample/요리아이콘.png';
import reportIcon from '../../../assets/sample/신고아이콘_회색.png';
import sampleProfileImg from '../../../assets/sample/profile.png';

import NutrientInfo from './NutrientInfo'; 
import SikBti from './SikBti';
import { useSelector } from 'react-redux';

// 신고
interface ReportTargetInfo {
  author: string;
  title: string;
  category: string;
  refNo: number;
}

interface DetailTableProps {
  recipe: RecipeDetail;
  onReportClick: (targetInfo: ReportTargetInfo) => void; // 신고
}

// 신고
const DetailTable: React.FC<DetailTableProps> = ({ recipe, onReportClick }) => {
  const loginUserNo = useSelector((state: RootState) => state.auth.user?.userNo);
  const isOwner = loginUserNo === recipe.writer?.userNo;
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${recipe.writer?.userNo}`);
  };

  // 신고
  const handleReportClick = () => {
    if (!recipe.writer) return;

    const targetInfo: ReportTargetInfo = {
      author: recipe.writer.username,
      title: recipe.rcpName,
      category: 'RECIPE',
      refNo: recipe.writer.userNo,
    };
    
    onReportClick(targetInfo);
  };

  const roundNutrients = (nutrients: typeof recipe.totalNutrient) => {
    const rounded = { ...nutrients };
    for (const key in rounded) {
      rounded[key as keyof typeof rounded] = parseFloat(
        rounded[key as keyof typeof rounded].toFixed(2)
      );
    }
    return rounded;
  };

  return (
    <div className={styles.food_info}>
      {/* --- 작성자 정보 및 신고 버튼 --- */}
      <div className={styles.user_report}>
        { !recipe.isOfficial &&(
          <>
            <div className={styles.writer_profile} onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
              <img src={recipe.writer?.serverName || sampleProfileImg} alt={recipe.writer?.username} />
              <div className={styles.profile_name}>
                {recipe.writer?.sikBti && <SikBti sikBti={recipe.writer.sikBti} style={{fontSize: '13px' }} />}
                <span className={styles.nickname}>{recipe.writer?.username}</span>
              </div>
            </div>
             {/* ---  신고 --- */}
              {!isOwner && (
                <button className={styles.report} onClick={handleReportClick}>
                  <img src={reportIcon} alt="신고" />
                  <span>신고하기</span>
                </button>
              )}
          </>
        )}
      </div>
      
      {/* --- 요리 정보, 재료, 영양성분 테이블 --- */}
      <table className={styles.info_table}>
        <tbody>
          <tr>
            <th><div id={styles.tag}># {recipe.tag}</div></th>
            <th>
              <img src={scaleIcon} height="25px" alt="조리방법"/>
              <span> 조리방법 </span>
              <span className={styles.info_value}>{recipe.rcpMethod}</span>
            </th>
            <th>
              <img src={hourglassIcon} height="25px" alt="요리종류"/>
              <span> 요리종류 </span>
              <span className={styles.info_value}>{recipe.rcpSituation}</span>
            </th>
            <th>
              <img src={cookingIcon} height="25px" alt="칼로리"/>
              <span> 칼로리 </span>
              <span className={styles.info_value}>{Math.round(recipe.totalNutrient.calories)}kcal</span>
            </th>
          </tr>

          {/* ✨ 재료 목록을 2열로 표시하는 로직 */}
          {recipe.rcpIngList ? (
            // 2-1. 공식 레시피일 경우 (rcpIngList 문자열이 존재)
            <tr>
              <td colSpan={4}>
                <div className={styles.official_ingredients_box}>
                  <h3>재료</h3>
                  <p>{recipe.rcpIngList}</p>
                </div>
              </td>
            </tr>
          ) : (
            // 2-2. 사용자 레시피일 경우 (ingredients 배열 사용)
            // React.Fragment(<></>)를 사용해 여러 <tr>을 감싸줍니다.
            <>
              {Array.from({ length: Math.ceil(recipe.ingredients.length / 2) }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  <td colSpan={2}>
                    {recipe.ingredients[rowIndex * 2] && (
                      <div className={styles.ing}>
                        <span>✔ </span>
                        <span>{recipe.ingredients[rowIndex * 2].ingName}</span>
                        <span>{recipe.ingredients[rowIndex * 2].quantity} </span>
                        <span>{recipe.ingredients[rowIndex * 2].weight}g</span>
                      </div>
                    )}
                  </td>
                  <td colSpan={2}>
                    {recipe.ingredients[rowIndex * 2 + 1] && (
                      <div className={styles.ing}>
                        <span>✔</span> 
                        <span>{recipe.ingredients[rowIndex * 2 + 1].ingName}</span>
                        <span>{recipe.ingredients[rowIndex * 2 + 1].quantity}</span>
                        <span>{recipe.ingredients[rowIndex * 2 + 1].weight}g</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </>
          )}

          <tr>
            <td colSpan={4}>
              {/* ✨ NutrientInfo 컴포넌트를 재사용하여 영양 정보 표시 */}
              <NutrientInfo nutrients={roundNutrients(recipe.totalNutrient)} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DetailTable;