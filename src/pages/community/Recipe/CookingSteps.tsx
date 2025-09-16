import React, { useState } from 'react';
import type { CookingStep } from '../../../type/Recipe';
import styles from './CookingSteps.module.css';

interface CookingStepsProps {
  steps: CookingStep[];
}

const CookingSteps: React.FC<CookingStepsProps> = ({ steps }) => {
  const [viewMode, setViewMode] = useState<'list' | 'one'>('list');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const toggleViewMode = () => setViewMode(prev => (prev === 'list' ? 'one' : 'list'));
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

      {viewMode === 'list' ? (
        <div>
          {steps.map((step, index) => (
            <React.Fragment key={step.rcpOrder}>
              <div id={styles.list}>
                <span style={{ color: index % 2 === 0 ? '#3E5822' : '#FE8051', fontWeight: 'bold' }}>{step.rcpOrder}.</span>
                <span>{step.description}</span>
                {step.serverName && <img src={`/images/${step.serverName}`} id={styles.list_img} alt={`Step ${step.rcpOrder}`} />}
              </div>
              <hr />
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div>
          <div id={styles.one_img}>
            <div id={styles.indicator}><div id={styles.indicator_bar} style={{ width: `${progressPercentage}%` }}></div></div>
            <button className={styles.nav} onClick={() => changeSlide(-1)}>◀</button>
            <div id={styles.slide}>
              {currentStep.serverName && <img src={`/images/${currentStep.serverName}`} height="510" width="510" alt={`Step ${currentStep.rcpOrder}`} />}
            </div>
            <button className={styles.nav} onClick={() => changeSlide(1)}>▶</button>
          </div>
          <br /><hr />
          <div id={styles.one_info}>
            <span style={{ fontSize: '28px', fontWeight: 500 }}>Step {currentStep.rcpOrder}.</span><br />
            <span style={{ fontSize: '18px' }}>{currentStep.description}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookingSteps;