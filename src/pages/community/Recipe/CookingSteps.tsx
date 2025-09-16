import React, { useState } from 'react';
import type { CookingStep } from '../../../type/Recipe';
import styles from './CookingSteps.module.css';

import listIcon from '../../../assets/sample/list.png';
import galleryIcon from '../../../assets/sample/gallery.png';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const lodingImg = {
  toggleList: listIcon,
  toggleGall: galleryIcon
};

interface CookingStepsProps {
  steps: CookingStep[];
}

const CookingSteps: React.FC<CookingStepsProps> = ({ steps }) => {
  
  // 'one' 뷰에서 현재 보여줄 조리 순서의 인덱스를 저장하는 state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // 토글 버튼
  const [isListView, setIsListView] = useState(true);
  const handleToggleView = () => {
    setIsListView(!isListView);
  };

  // 슬라이드 이전/다음 버튼을 처리하는 함수
  const changeSlide = (direction: number) => {
    const newIndex = currentStepIndex + direction;
    // 배열 범위를 벗어나지 않도록 체크
    if (newIndex >= 0 && newIndex < steps.length) {
      setCurrentStepIndex(newIndex);
    }
  };

  // 데이터가 없으면 아무것도 렌더링하지 않음
  if (!steps || steps.length === 0) {
    return <div>조리 순서 정보가 없습니다.</div>;
  }

  // 현재 슬라이드에 해당하는 데이터와 인디케이터 너비 계산
  const currentStep = steps[currentStepIndex];
  const indicatorWidth = ((currentStepIndex + 1) / steps.length) * 100;


  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div>조리순서🍳</div>
        {/* ✅ 핸들러 연결 및 클래스 동적 적용 */}
        <div className={cx("toggle-area", { toggled: !isListView })} onClick={handleToggleView}>
          <div className={styles.slide} />
          <img src={lodingImg.toggleList} className={cx("toggle-icon", "listIcon")} alt="목록 보기" />
          <img src={lodingImg.toggleGall} className={cx("toggle-icon", "galleryIcon")} alt="하나씩 보기" />
        </div>
      </div>
      <hr />

      {/* ✅ isListView 상태 값에 따라 다른 JSX를 렌더링 */}
      {isListView ? (
        // ==================== 목록 뷰 📄 ====================
        <div className={styles.list_method}>
          {steps.map((step, index) => (
            <React.Fragment key={step.rcpOrder}>
              <div className={styles.list}>
                <span style={{ color: index % 2 === 0 ? '#3E5822' : '#FE8051', fontWeight: 'bold' }}>
                  {step.rcpOrder}.
                </span>
                <span>{step.description}</span>
                {step.serverName && (
                  <img src={step.serverName} alt={`Step ${step.rcpOrder}`} className={styles.list_img} />
                )}
              </div>
              <hr />
            </React.Fragment>
          ))}
        </div>
      ) : (
        // ==================== 슬라이드 뷰 🖼️ ====================
        <div className={styles.one_method}>
          <div className={styles.one_img}>
            <div className={styles.indicator}>
              <div className={styles.indicator_bar} style={{ width: `${indicatorWidth}%` }}></div>
            </div>
            <button className={styles.nav} onClick={() => changeSlide(-1)} disabled={currentStepIndex === 0}>◀</button>
            <div className={styles.one_slide}>
              {currentStep.serverName && (
                <img src={currentStep.serverName} alt={`Step ${currentStep.rcpOrder}`} />
              )}
            </div>
            <button className={styles.nav} onClick={() => changeSlide(1)} disabled={currentStepIndex === steps.length - 1}>▶</button>
          </div>
          <hr />
          <div className={styles.one_info}>
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