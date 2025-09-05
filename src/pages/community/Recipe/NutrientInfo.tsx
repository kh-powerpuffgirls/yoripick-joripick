import React from 'react';
import nut from './NutrientInfo.module.css';

// NutrientInfo 컴포넌트가 받을 props의 타입을 정의합니다.
interface NutrientData {
  carbs: number;    // 탄수화물 (g)
  protein: number;  // 단백질 (g)
  fat: number;      // 지방 (g)
  sodium: number;   // 나트륨 (mg)
  calories: number; // 칼로리 (kcal)
}

interface NutrientInfoProps {
  nutrients: NutrientData;
}

// 영양성분 기준값
const NUTRIENT_GOALS = {
  carbs: 300,
  protein: 60,
  fat: 60,
  sodium: 2000,
  calories: 2500,
};

const NutrientInfo: React.FC<NutrientInfoProps> = ({ nutrients }) => {
  // 입력 값에 따라 progress bar의 비율을 계산합니다.
  const getPercentage = (value: number, goal: number) => {
    if (goal === 0) return 0;
    const percentage = (value / goal) * 100;
    return Math.min(percentage, 100); // 100%를 넘지 않도록
  };
  
  const carbPercent = getPercentage(nutrients.carbs, NUTRIENT_GOALS.carbs);
  const proteinPercent = getPercentage(nutrients.protein, NUTRIENT_GOALS.protein);
  const fatPercent = getPercentage(nutrients.fat, NUTRIENT_GOALS.fat);
  const sodiumPercent = getPercentage(nutrients.sodium, NUTRIENT_GOALS.sodium);

  // 칼로리 차트의 각도를 계산합니다 (360도 기준).
  const calorieAngle = (nutrients.calories / NUTRIENT_GOALS.calories) * 360;

  return (
    <div className={nut.nutrient}>
      <div id={nut.cpfn}>
        <div id={nut.bars}>
          <span>탄수화물</span>
          <span>{nut.carbs}g</span>
          <div className={nut.progress}>
            <div className={nut.bar_progress} style={{ width: `${carbPercent}%`, backgroundColor: '#4F98FF' }}></div>
          </div>
        </div>
        <div id={nut.bars}>
          <span>단백질</span>
          <span>{nutrients.protein}g</span>
          <div className={nut.progress}>
            <div className={nut.bar_progress} style={{ width: `${proteinPercent}%`, backgroundColor: '#FBB871' }}></div>
          </div>
        </div>
        <div id={nut.bars}>
          <span>지방</span>
          <span>{nutrients.fat}g</span>
          <div className={nut.progress}>
            <div className={nut.bar_progress} style={{ width: `${fatPercent}%`, backgroundColor: '#9986DD' }}></div>
          </div>
        </div>
        <div id={nut.bars}>
          <span>나트륨</span>
          <span>{nutrients.sodium}mg</span>
          <div className={nut.progress}>
            <div className={nut.bar_progress} style={{ width: `${sodiumPercent}%`, backgroundColor: '#77D57A' }}></div>
          </div>
        </div>
      </div>
      <div id={nut.kcal}>
        <div className={nut.chart}>
            {/* conic-gradient를 사용하여 원형 차트를 동적으로 그립니다. */}
          <div className={nut.rad_chart} style={{ background: `conic-gradient(#FEBEA2 ${calorieAngle}deg, #D3EA9A ${calorieAngle}deg)`}}></div>
        </div>
        <span>칼로리 {nutrients.calories}kcal</span>
      </div>
    </div>
  );
};

export default NutrientInfo;

