import React, { useState } from 'react';
import type { CookingStep } from '../../../type/Recipe'; 
import styles from './CookingSteps.module.css';
import classNames from 'classnames/bind';

import listIcon from '../../../assets/sample/list.png';
import galleryIcon from '../../../assets/sample/gallery.png';

// const cx = classNames.bind(styles);

// const lodingImg = {
//   toggleList: listIcon,
//   toggleGall: galleryIcon
// };

interface CookingStepsProps {
  steps: CookingStep[];
}

const CookingSteps: React.FC<CookingStepsProps> = ({ steps }) => {
  // ✨ 'list' 뷰와 'one' (슬라이드) 뷰를 전환하기 위한 state
  const [viewMode, setViewMode] = useState<'list' | 'one'>('list');
  
  // ✨ 'one' 뷰에서 현재 보여줄 조리 순서의 인덱스(순번)를 저장하는 state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // 뷰 모드를 전환하는 함수
  const toggleViewMode = () => {
    setViewMode(prevMode => (prevMode === 'list' ? 'one' : 'list'));
  };

  // 슬라이드 이전/다음 버튼을 처리하는 함수
  const changeSlide = (direction: number) => {
    const newIndex = currentStepIndex + direction;
    if (newIndex >= 0 && newIndex < steps.length) {
      setCurrentStepIndex(newIndex);
    }
  };

  const currentStep = steps[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className={viewMode === 'list' ? styles.list_method : styles.one_method}>
      <div className={styles.info}>
        <div>조리순서🍳</div>
        <button onClick={toggleViewMode}>
          {viewMode === 'list' ? '슬라이드로 보기' : '목록으로 보기'}
        </button>
      </div>
      <hr />

      {/* ✨ viewMode 값에 따라 목록 뷰 또는 슬라이드 뷰를 조건부 렌더링 */}
      {viewMode === 'list' ? (
        // ==================== 목록 뷰 ====================
        <div>
          {steps.map((step, index) => {
            return (
              <React.Fragment key={step.rcpOrder}>
                <div id={styles.list}>
                  <span style={{ color: index % 2 === 0 ? '#3E5822' : '#FE8051', fontWeight: 'bold' }}>
                    {step.rcpOrder}.
                  </span>
                  <span>{step.description}</span>
                  <img src={step.serverName} id={styles.list_img} alt={`Step ${step.rcpOrder}`} />
                </div>
                <hr />
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        // ==================== 슬라이드 뷰 ====================
        <div>
          <div id={styles.one_img}>
            <div id={styles.indicator}>
              <div id={styles.indicator_bar} style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <button className={styles.nav} onClick={() => changeSlide(-1)}>◀</button>
            <div id={styles.slide}>
              <img src={currentStep.serverName} height="510" width="510" alt={`Step ${currentStep.rcpOrder}`} />
            </div>
            <button className={styles.nav} onClick={() => changeSlide(1)}>▶</button>
          </div>
          <br />
          <hr />
          <div id={styles.one_info}>
            <span style={{ fontSize: '28px', fontWeight: 500 }}>Step {currentStep.rcpOrder}.</span>
            <br />
            <span style={{ fontSize: '18px' }}>{currentStep.description}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookingSteps;

