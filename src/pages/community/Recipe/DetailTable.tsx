import React from 'react';
import type { RecipeDetail } from '../../../type/Recipe';
import styles from './DetailTable.module.css';

// 아이콘 import
import scaleIcon from '../../../assets/sample/저울아이콘.png';
import hourglassIcon from '../../../assets/sample/모래시계아이콘.png';
import cookingIcon from '../../../assets/sample/요리아이콘.png';
import reportIcon from '../../../assets/sample/신고아이콘_회색.png';
import NutrientInfo from './NutrientInfo'; 

interface DetailTableProps {
  recipe: RecipeDetail;
}

const DetailTable: React.FC<DetailTableProps> = ({ recipe }) => {

  return (
    <div className={styles.food_info}>
      {/* --- 작성자 정보 및 신고 버튼 --- */}
      <div className={styles.user_report}>
        <div className={styles.writer_profile}>
          <img src={recipe.writer.serverName} alt={recipe.writer.username} />
          <div className={styles.profile_name}>
            <span className={styles.eat_bti}>{recipe.writer.sik_bti}</span>
            <span className={styles.nickname}>{recipe.writer.username}</span>
          </div>
        </div>
        <button className={styles.report}>
          <img src={reportIcon} alt="신고" />
          <span>신고하기</span>
        </button>
      </div>
      
      {/* --- 요리 정보, 재료, 영양성분 테이블 --- */}
      <table className={styles.info_table}>
        <tbody>
          <tr style={{ backgroundColor: '#E8E8E8' }}>
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
          {Array.from({ length: Math.ceil(recipe.ingredients.length / 2) }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              <td colSpan={2}>
                {recipe.ingredients[rowIndex * 2] && (
                  <div className={styles.ing}>
                    <span>✔ {recipe.ingredients[rowIndex * 2].ingName}</span>
                    <span>{recipe.ingredients[rowIndex * 2].quantity} ({recipe.ingredients[rowIndex * 2].weight}g)</span>
                  </div>
                )}
              </td>
              <td colSpan={2}>
                {recipe.ingredients[rowIndex * 2 + 1] && (
                  <div className={styles.ing}>
                    <span>✔ {recipe.ingredients[rowIndex * 2 + 1].ingName}</span>
                    <span>{recipe.ingredients[rowIndex * 2 + 1].quantity} ({recipe.ingredients[rowIndex * 2 + 1].weight}g)</span>
                  </div>
                )}
              </td>
            </tr>
          ))}

          <tr>
            <td colSpan={4}>
              {/* ✨ NutrientInfo 컴포넌트를 재사용하여 영양 정보 표시 */}
              <NutrientInfo nutrients={{
                calories: recipe.totalNutrient.calories,
                carbs: recipe.totalNutrient.carbs,
                protein: recipe.totalNutrient.protein,
                fat: recipe.totalNutrient.fat,
                sodium: recipe.totalNutrient.sodium
              }} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DetailTable;