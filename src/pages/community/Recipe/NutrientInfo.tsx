import React from 'react';
import nut from './NutrientInfo.module.css';
import type { NutrientData } from '../../../type/Recipe';

interface NutrientInfoProps {
  nutrients: NutrientData;
}

const NUTRIENT_GOALS = {
  carbs: 300,
  protein: 60,
  fat: 60,
  sodium: 2000,
  calories: 2500,
};

const NutrientInfo: React.FC<NutrientInfoProps> = ({ nutrients }) => {
  
  const getPercentage = (value: number, goal: number) => {
    if (goal === 0) return 0;
    const percentage = (value / goal) * 100;
    // ✨ 수정된 부분: 100%를 넘을 수 있도록 Math.min 제거
    return percentage;
  };
  
  // ✨ 추가된 부분 시작
  // 초과된 양(g, kcal)을 계산하는 함수
  const getExceededAmount = (value: number, goal: number): number => {
    if (value > goal) {
        return Math.round(value - goal);
    }
    return 0;
  };

  const carbPercent = getPercentage(nutrients.carbs, NUTRIENT_GOALS.carbs);
  const proteinPercent = getPercentage(nutrients.protein, NUTRIENT_GOALS.protein);
  const fatPercent = getPercentage(nutrients.fat, NUTRIENT_GOALS.fat);
  const sodiumPercent = getPercentage(nutrients.sodium, NUTRIENT_GOALS.sodium);
  const caloriePercent = getPercentage(nutrients.calories, NUTRIENT_GOALS.calories);

  // 각 영양소별 초과량 계산
  const exceededCarb = getExceededAmount(nutrients.carbs, NUTRIENT_GOALS.carbs);
  const exceededProtein = getExceededAmount(nutrients.protein, NUTRIENT_GOALS.protein);
  const exceededFat = getExceededAmount(nutrients.fat, NUTRIENT_GOALS.fat);
  const exceededSodium = getExceededAmount(nutrients.sodium, NUTRIENT_GOALS.sodium);
  const exceededCalories = getExceededAmount(nutrients.calories, NUTRIENT_GOALS.calories);
  // ✨ 추가된 부분 끝

  const calorieAngle = (nutrients.calories / NUTRIENT_GOALS.calories) * 360;

  return (
    <div className={nut.nutrient}>
      <div id={nut.cpfn}>
        {/* 탄수화물 */}
        <div id={nut.bars}>
          <span>탄수화물</span>
          <span>{nutrients.carbs}g</span>
          <div className={nut.progress}>
            <div 
              className={nut.bar_progress} 
              style={{ 
                width: `${Math.min(carbPercent, 100)}%`, 
                // ✨ 추가된 부분: 초과 시 배경색 변경
                backgroundColor: carbPercent > 100 ? '#FF6767' : '#4F98FF' 
              }}>
                {/* ✨ 추가된 부분: 초과 시 경고 텍스트 표시 */}
                {carbPercent > 100 && (
                  <span className={nut.bar_exceeded_text} style={{ color: '#EFDE7D' }}>
                    ⚠{exceededCarb}g초과
                  </span>
                )}
            </div>
          </div>
        </div>
        {/* 단백질 */}
        <div id={nut.bars}>
          <span>단백질</span>
          <span>{nutrients.protein}g</span>
          <div className={nut.progress}>
            <div 
              className={nut.bar_progress} 
              style={{ 
                width: `${Math.min(proteinPercent, 100)}%`, 
                // ✨ 추가된 부분: 초과 시 배경색 변경
                backgroundColor: proteinPercent > 100 ? '#FF6767' : '#FBB871' 
              }}>
                {/* ✨ 추가된 부분: 초과 시 경고 텍스트 표시 */}
                {proteinPercent > 100 && (
                  <span className={nut.bar_exceeded_text} style={{ color: '#EFDE7D' }}>
                    ⚠{exceededProtein}g초과
                  </span>
                )}
            </div>
          </div>
        </div>
        {/* 지방 */}
        <div id={nut.bars}>
          <span>지방</span>
          <span>{nutrients.fat}g</span>
          <div className={nut.progress}>
            <div 
              className={nut.bar_progress} 
              style={{ 
                width: `${Math.min(fatPercent, 100)}%`, 
                // ✨ 추가된 부분: 초과 시 배경색 변경
                backgroundColor: fatPercent > 100 ? '#FF6767' : '#9986DD' 
              }}>
                {/* ✨ 추가된 부분: 초과 시 경고 텍스트 표시 */}
                {fatPercent > 100 && (
                  <span className={nut.bar_exceeded_text} style={{ color: '#EFDE7D' }}>
                    ⚠{exceededFat}g초과
                  </span>
                )}
            </div>
          </div>
        </div>
        {/* 나트륨 */}
        <div id={nut.bars}>
          <span>나트륨</span>
          <span>{nutrients.sodium}mg</span>
          <div className={nut.progress}>
            <div 
              className={nut.bar_progress} 
              style={{ 
                width: `${Math.min(sodiumPercent, 100)}%`, 
                // ✨ 추가된 부분: 초과 시 배경색 변경
                backgroundColor: sodiumPercent > 100 ? '#FF6767' : '#77D57A' 
              }}>
                {/* ✨ 추가된 부분: 초과 시 경고 텍스트 표시 */}
                {sodiumPercent > 100 && (
                  <span className={nut.bar_exceeded_text} style={{ color: '#EFDE7D' }}>
                    ⚠{exceededSodium}mg초과
                  </span>
                )}
            </div>
          </div>
        </div>
      </div>
      <div id={nut.kcal}>
        <div className={nut.chart}>
          <div 
            className={nut.rad_chart} 
            style={{ background: `conic-gradient(${caloriePercent > 100 ? '#FF6767' : '#FEBEA2'} ${Math.min(calorieAngle, 360)}deg, #D3EA9A 0deg)`}}
          ></div>
           {caloriePercent > 100 && (
              <div className={nut.exceeded_info_wrapper}>
                <span className={nut.kcal_exceeded_text} style={{ color: '#EFDE7D' }}>
                  ⚠{exceededCalories}kcal초과
                </span>
              </div>
           )}
        </div>
        <span>칼로리 {nutrients.calories}kcal</span>
      </div>
    </div>
  );
};

export default NutrientInfo;