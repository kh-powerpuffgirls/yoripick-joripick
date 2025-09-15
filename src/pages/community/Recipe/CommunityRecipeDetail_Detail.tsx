import React, { useState } from 'react';
import styles from './CommunityRecipeDetail_Detail.module.css';
import classNames from 'classnames/bind';

// --- 타입 import ---
// 부모로부터 받을 데이터 타입을 위해 CookingStep 타입을 import 합니다.
import type { CookingStep } from '../../../type/Recipe';

// --- 이미지 import ---
import listIcon from '../../../assets/sample/list.png';
import galleryIcon from '../../../assets/sample/gallery.png';

const cx = classNames.bind(styles);

const lodingImg = {
  toggleList: listIcon,
  toggleGall: galleryIcon
};

// --- Props 타입 정의 ---
// [수정] 부모 컴포넌트로부터 steps 배열을 받기 위한 인터페이스를 정의합니다.
interface DetailProps {
  steps: CookingStep[];
}

// [수정] 컴포넌트가 props (steps)를 받도록 수정합니다.
const CommunityRecipeDetail_Detail: React.FC<DetailProps> = ({ steps }) => {
  // [삭제] 기존에 있던 mockSteps 배열을 삭제합니다. 이제 props로 실제 데이터를 받습니다.

  const [isListView, setIsListView] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleToggleView = () => {
    setIsListView(!isListView);
  };
  
  const changeSlide = (direction: number) => {
    const newIndex = currentStepIndex + direction;
    // [수정] mockSteps.length 대신 props로 받은 steps.length를 사용합니다.
    if (newIndex >= 0 && newIndex < steps.length) {
      setCurrentStepIndex(newIndex);
    }
  };
  
  // [수정] props로 받은 steps 배열에서 현재 스텝 정보를 가져옵니다.
  const currentStep = steps[currentStepIndex];
  const indicatorWidth = ((currentStepIndex + 1) / steps.length) * 100;

  // [수정] steps 데이터가 없거나 비어있을 경우를 대비한 방어 코드를 추가합니다.
  if (!steps || steps.length === 0) {
    return (
        <div className={styles.container}>
            <div className={styles.info}>
                <div>조리순서🍳</div>
            </div>
            <hr />
            <p>조리 순서 정보가 없습니다.</p>
        </div>
    );
  }

  return (
    <div className={styles.container}>
      {isListView ? (
        // "목록으로 보기" 뷰
        <div className={styles.list_method}>
          <div className={styles.info}>
            <div>조리순서🍳</div>
            <div className={cx("toggle-area", { toggled: !isListView })} onClick={handleToggleView}>
              <div className={styles.slide} />
              <img src={lodingImg.toggleList} className={cx("toggle-icon", "listIcon")} alt="목록 보기" />
              <img src={lodingImg.toggleGall} className={cx("toggle-icon", "galleryIcon")} alt="하나씩 보기" />
            </div> 
          </div>
          <hr />
          {/* [수정] mockSteps.map 대신 props로 받은 steps.map을 사용합니다. */}
          {steps.map((step) => (
            // [수정] key 값을 고유한 step.rcpOrder로 변경합니다.
            <React.Fragment key={step.rcpOrder}>
              <div className={styles.list}>
                {/* [수정] step.order 대신 step.rcpOrder를 사용합니다. */}
                <span style={{ color: step.rcpOrder % 2 !== 0 ? '#3E5822' : '#FE8051', fontWeight: 'bold' }}>
                  {step.rcpOrder}.
                </span>
                {/* [수정] step.description을 사용합니다. */}
                <span>{step.description}</span>
                {/* [수정] 이미지 경로를 step.serverName으로 변경하고, 이미지가 없을 경우 렌더링하지 않습니다. */}
                {step.serverName && <img src={step.serverName} alt={`Step ${step.rcpOrder}`} className={styles.list_img} />}
              </div>
              <hr />
            </React.Fragment>
          ))}
        </div>
      ) : (
        // "하나씩 보기" 뷰
        <div className={styles.one_method}>
          <div className={styles.info}>
            <div>조리순서🍳</div>
            <div className={cx("toggle-area", { toggled: !isListView })} onClick={handleToggleView}>
              <div className={styles.slide} />
              <img src={lodingImg.toggleList} className={cx("toggle-icon", "listIcon")} alt="목록 보기" />
              <img src={lodingImg.toggleGall} className={cx("toggle-icon", "galleryIcon")} alt="하나씩 보기" />
            </div> 
          </div>
          <hr />
          <div className={styles.one_img}>
            <div className={styles.indicator}>
              <div className={styles.indicator_bar} style={{ width: `${indicatorWidth}%` }}></div>
            </div>
            <button className={`${styles.nav} ${styles.left}`} onClick={() => changeSlide(-1)} disabled={currentStepIndex === 0}>◀</button>
            <div className={styles.one_slide}>
              {/* [수정] 이미지 경로를 currentStep.serverName으로 변경하고, 이미지가 없을 경우 대체 텍스트를 보여줍니다. */}
              {currentStep.serverName ? (
                <img src={currentStep.serverName} alt={`Step ${currentStep.rcpOrder}`} />
              ) : (
                <div className={styles.no_image}>이미지가 없습니다.</div>
              )}
            </div>
            {/* [수정] disabled 조건을 steps.length 기준으로 변경합니다. */}
            <button className={`${styles.nav} ${styles.right}`} onClick={() => changeSlide(1)} disabled={currentStepIndex === steps.length - 1}>▶</button>
          </div>
          <br />
          <hr />
          <div className={styles.one_info}>
            {/* [수정] step.order 대신 step.rcpOrder를 사용합니다. */}
            <span style={{ fontSize: '28px', fontWeight: 500 }}>Step {currentStep.rcpOrder}.</span>
            <br />
            <span style={{ fontSize: '18px' }}>{currentStep.description}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityRecipeDetail_Detail;