import React from 'react';
import recipecard from './RecipeCard.module.css'; // RecipeCard 전용 CSS (기존 CSS에서 .content 부분 분리)

// 샘플 이미지 import
import starIcon from '../../../assets/sample/star.png';
import type { RecipeListItem } from '../../../type/Recipe';
import SikBti from './SikBti';


// RecipeCard가 받을 데이터(props)의 타입을 지정
interface RecipeCardProps {
  recipe: RecipeListItem; 
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {

  return (
    <div className={recipecard.content}>
      <div className={recipecard.imageBox}>
        <img src={recipe.serverName} alt={recipe.rcpName} className={recipecard.thumbnail} />
      </div>
      <div id={recipecard.title}>{recipe.rcpName}</div>
      <div className={recipecard.profile}>
        <img src={recipe.userProfileImage} alt={recipe.username} />
        <div className={recipecard.profile_name}>
          {recipe.sikBti && <SikBti sikBti={recipe.sikBti} style={{fontSize: '8px' }} />}
          <span className={recipecard.nickname}>{recipe.username}</span>
        </div>

        <span className={recipecard.date}>{new Date(recipe.createdAt).toLocaleDateString()}</span>
        
        <div className={recipecard.stars}>
          <img src={starIcon} height="12px" width="12px" alt="별점" />
          {/* ✨ avgStars 데이터를 소수점 첫째 자리까지 표시, 리뷰가 없으면 0.0으로 표시 */}
          <span>{(recipe.avgStars || 0).toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;