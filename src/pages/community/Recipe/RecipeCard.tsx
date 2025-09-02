import React from 'react';
import recipecard from './RecipeCard.module.css'; // RecipeCard 전용 CSS (기존 CSS에서 .content 부분 분리)

// 샘플 이미지 import
import sampleRecipeImg from '../../../assets/sample/recipe.png';
import sampleProfileImg from '../../../assets/sample/profile.png';
import starIcon from '../../../assets/sample/star.png';
import type { Recipe } from '../../../type/Recipe';


// RecipeCard가 받을 데이터(props)의 타입을 지정
interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className={recipecard.content}>
      <img src={recipe.imageUrl || sampleRecipeImg} alt={recipe.rcp_name} />
      <div id={recipecard.title}>{recipe.rcp_name}</div>
      <div className={recipecard.profile}>
        <img src={recipe.userInfo?.profileImage || sampleProfileImg} alt={recipe.userInfo?.nickname} />
        <div className={recipecard.profile_name}>
          <span className={recipecard.eat_bti}>{recipe.userInfo?.eat_bti || '미식가'}</span>
          <span className={recipecard.nickname}>{recipe.userInfo?.nickname || '익명'}</span>
        </div>
        <span className={recipecard.date}>{new Date(recipe.created_at).toLocaleDateString()}</span>
        <div className={recipecard.stars}>
          <img src={starIcon} height="12px" width="12px" alt="별점" />
          <span>{recipe.stars || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;