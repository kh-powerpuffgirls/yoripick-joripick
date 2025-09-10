import React, { useState } from 'react';
import styles from './CommunityRecipeDetail_Detail.module.css';
import classNames from 'classnames/bind';

// [수정] Vite 환경에 맞는 상대 경로로 이미지 import 경로를 수정합니다.
import listIcon from '../../../assets/sample/list.png';
import galleryIcon from '../../../assets/sample/gallery.png';
import recipeImage from '../../../assets/sample/recipe.png';

const cx = classNames.bind(styles);

const lodingImg = {
  toggleList: listIcon,
  toggleGall: galleryIcon
};

interface RecipeStep {
  order: number;
  description: string;
  imageSrc: string;
}

const CommunityRecipeDetail_Detail: React.FC = () => {
  const mockSteps: RecipeStep[] = [
    {
      order: 1,
      description: '팽이버섯은 아래쪽 뿌리 부분(균사체)을 잘라내 주고, 모양을 살려고 2~3줄 씩 듬성 듬성 찢어주세요. 쪽파와 청양고추는 송송 썰어 주세요.',
      imageSrc: recipeImage, // [수정] import한 이미지 변수를 사용합니다.
    },
    {
      order: 2,
      description: '볼에 고추장, 연두순, 참기름, 설탕을 넣고 잘섞어서 양념장을 만들어주세요.',
      imageSrc: recipeImage,
    },
    {
      order: 3,
      description: '중불의 팬에 기름을 두르고, 팽이버섯을 올려서 숨이 죽어 부드러워질때까지 앞뒤로 구워주세요.(약 2~3분)',
      imageSrc: recipeImage,
    },
    {
      order: 4,
      description: '팽이버섯 위에 양념장을 고루 발라주고, 약불로 줄여 썬 고추와 쪾파를 얹어 3~5분 동안 더 졸여주세요. 버섯에서 물이 나오면서 양념이 잘 스며들면 완성!',
      imageSrc: recipeImage,
    },
  ];

  const [isListView, setIsListView] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleToggleView = () => {
    setIsListView(!isListView);
  };
  
  const changeSlide = (direction: number) => {
    const newIndex = currentStepIndex + direction;
    if (newIndex >= 0 && newIndex < mockSteps.length) {
      setCurrentStepIndex(newIndex);
    }
  };

  const currentStep = mockSteps[currentStepIndex];
  const indicatorWidth = ((currentStepIndex + 1) / mockSteps.length) * 100;

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
          {mockSteps.map((step) => (
            <React.Fragment key={step.order}>
              <div className={styles.list}>
                <span style={{ color: step.order % 2 !== 0 ? '#3E5822' : '#FE8051', fontWeight: 'bold' }}>
                  {step.order}.
                </span>
                <span>{step.description}</span>
                <img src={step.imageSrc} alt={`Step ${step.order}`} className={styles.list_img} />
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
              <img src={currentStep.imageSrc} alt={`Step ${currentStep.order}`} height="510" width="510" />
            </div>
            <button className={`${styles.nav} ${styles.right}`} onClick={() => changeSlide(1)} disabled={currentStepIndex === mockSteps.length - 1}>▶</button>
          </div>
          <br />
          <hr />
          <div className={styles.one_info}>
            <span style={{ fontSize: '28px', fontWeight: 500 }}>Step {currentStep.order}.</span>
            <br />
            <span style={{ fontSize: '18px' }}>{currentStep.description}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityRecipeDetail_Detail;

