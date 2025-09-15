import React from 'react';
import nut from './mealplanNut.module.css';

export interface NutrientData {
  carbs: number;
  protein: number;
  fat: number;
  sodium: number;
  energy: number;
}

interface NutrientInfoProps {
  nutrients: NutrientData;
}

const NUTRIENT_GOALS = {
  carbs: 300,
  protein: 60,
  fat: 60,
  sodium: 2000,
  energy: 2500,
};

const NutrientInfo: React.FC<NutrientInfoProps> = ({ nutrients }) => {
  const getPercentage = (value: number, goal: number) => {
    if (goal === 0) return 0;
    const percentage = (value / goal) * 100;
    return Math.min(percentage, 100);
  };

  const caloriesPercent = getPercentage(nutrients.energy, NUTRIENT_GOALS.energy);
  const carbPercent = getPercentage(nutrients.carbs, NUTRIENT_GOALS.carbs);
  const proteinPercent = getPercentage(nutrients.protein, NUTRIENT_GOALS.protein);
  const fatPercent = getPercentage(nutrients.fat, NUTRIENT_GOALS.fat);
  const sodiumPercent = getPercentage(nutrients.sodium, NUTRIENT_GOALS.sodium);

  return (
    <div className={nut.nutrient}>
      <div>
        <div className={nut.bars}>
          <div className={nut.tags}>
            <span>총 섭취량</span>
            <span>{nutrients.energy} / {NUTRIENT_GOALS.energy} kcal</span>
          </div>
          <div className={nut.progress}>
            <div className={nut.bar_progress} style={{ width: `${caloriesPercent}%`, backgroundColor: '#FEBEA2' }}></div>
          </div>
        </div>

        <div className={nut.bars}>
          <div className={nut.tags}>
            <span>탄수화물</span>
            <span>{nutrients.carbs} / {NUTRIENT_GOALS.carbs} g</span>
          </div>
          <div className={nut.progress}>
            <div className={nut.bar_progress} style={{ width: `${carbPercent}%`, backgroundColor: '#4F98FF' }}></div>
          </div>
        </div>

        <div className={nut.bars}>
          <div className={nut.tags}>
            <span>단백질</span>
            <span>{nutrients.protein} / {NUTRIENT_GOALS.protein} g</span>
          </div>
          <div className={nut.progress}>
            <div className={nut.bar_progress} style={{ width: `${proteinPercent}%`, backgroundColor: '#FBB871' }}></div>
          </div>
        </div>

        <div className={nut.bars}>
          <div className={nut.tags}>
            <span>지방</span>
            <span>{nutrients.fat} / {NUTRIENT_GOALS.fat} g</span>
          </div>
          <div className={nut.progress}>
            <div className={nut.bar_progress} style={{ width: `${fatPercent}%`, backgroundColor: '#9986DD' }}></div>
          </div>
        </div>

        <div className={nut.bars}>
          <div className={nut.tags}>
            <span>나트륨</span>
            <span>{nutrients.sodium} / {NUTRIENT_GOALS.sodium} mg</span>
          </div>
          <div className={nut.progress}>
            <div className={nut.bar_progress} style={{ width: `${sodiumPercent}%`, backgroundColor: '#77D57A' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutrientInfo;

