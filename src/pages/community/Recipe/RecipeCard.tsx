import React from 'react';
import recipecard from './RecipeCard.module.css'; // RecipeCard 전용 CSS (기존 CSS에서 .content 부분 분리)

// 샘플 이미지 import
import sampleRecipeImg from '../../../assets/sample/recipe.png';
import sampleProfileImg from '../../../assets/sample/profile.png';
import starIcon from '../../../assets/sample/star.png';
import type { RecipeListItem } from '../../../type/Recipe';
import SikBti from './SikBti';


// RecipeCard가 받을 데이터(props)의 타입을 지정
interface RecipeCardProps {
  recipe: RecipeListItem; 
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {

  const recipeImageUrl = recipe.serverName 
    ? `/resources/upload/recipe/${recipe.serverName}` 
    : sampleRecipeImg;

  const profileImageUrl = recipe.userProfileImage
    ? `/resources/upload/profile/${recipe.userProfileImage}`
    : sampleProfileImg;

  return (
    <div className={recipecard.content}>
      <img src={recipeImageUrl} alt={recipe.rcpName} />
      <div id={recipecard.title}>{recipe.rcpName}</div>
      <div className={recipecard.profile}>
        <img src={profileImageUrl} alt={recipe.username} />
        <div className={recipecard.profile_name}>
          
          {/* ✨ sikBti 데이터가 있을 경우에만 SikBti 컴포넌트를 렌더링 */}
          {recipe.sikBti && <SikBti sikBti={recipe.sikBti} />}

          <span className={recipecard.nickname}>{recipe.username}</span>
        </div>
        
        {/* ✨ createdAt 데이터 사용 */}
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