import React, { useState } from 'react';

// CSS 모듈 파일을 import 합니다.
import styles from './CommunityRecipeDetail_Detail.module.css';

// 1. 타입 정의: 요리 순서 데이터의 형태를 미리 정의합니다.
interface RecipeStep {
  order: number;
  description: string;
  imageSrc: string; // 이미지 경로
}

const CommunityRecipeDetail_Detail: React.FC = () => {
  // 2. 임시(mock) 데이터: DB에서 가져올 데이터를 가정하여 만듭니다.
  // 나중에 이 부분을 API 호출로 대체하면 됩니다.
  const mockSteps: RecipeStep[] = [
    {
      order: 1,
      description: '팽이버섯은 아래쪽 뿌리 부분(균사체)을 잘라내 주고, 모양을 살려고 2~3줄 씩 듬성 듬성 찢어주세요. 쪽파와 청양고추는 송송 썰어 주세요.',
      imageSrc: '/src/assets/sample/recipe.png', // 실제 이미지 경로로 수정해주세요.
    },
    {
      order: 2,
      description: '볼에 고추장, 연두순, 참기름, 설탕을 넣고 잘섞어서 양념장을 만들어주세요.',
      imageSrc: '/src/assets/sample/recipe.png',
    },
    {
      order: 3,
      description: '중불의 팬에 기름을 두르고, 팽이버섯을 올려서 숨이 죽어 부드러워질때까지 앞뒤로 구워주세요.(약 2~3분)',
      imageSrc: '/src/assets/sample/recipe.png',
    },
    {
      order: 4,
      description: '팽이버섯 위에 양념장을 고루 발라주고, 약불로 줄여 썬 고추와 쪾파를 얹어 3~5분 동안 더 졸여주세요. 버섯에서 물이 나오면서 양념이 잘 스며들면 완성!',
      imageSrc: '/src/assets/sample/recipe.png',
    },
  ];

  // 3. State 관리
  // '목록 보기'(true)와 '하나씩 보기'(false)를 전환하는 상태
  const [isListView, setIsListView] = useState(true);
  // '하나씩 보기'에서 현재 보여줄 단계의 인덱스(순서)를 저장하는 상태
  const [currentStepIndex, setCurrentStepIndex] = useState(0);


  // 4. 이벤트 핸들러
  // 토글 버튼 클릭 시 isListView 상태를 반전시킵니다.
  const handleToggleView = () => {
    setIsListView(!isListView);
  };
  
  // 슬라이드 이동 함수
  const changeSlide = (direction: number) => {
    const newIndex = currentStepIndex + direction;
    // 인덱스가 데이터 범위를 벗어나지 않도록 방지
    if (newIndex >= 0 && newIndex < mockSteps.length) {
      setCurrentStepIndex(newIndex);
    }
  };

  // 현재 보여줄 요리 단계 데이터
  const currentStep = mockSteps[currentStepIndex];
  
  // 인디케이터 바의 너비 계산
  const indicatorWidth = ((currentStepIndex + 1) / mockSteps.length) * 100;

  return (
    <div className={styles.container}>
      {/* 5. 조건부 렌더링: isListView 값에 따라 다른 뷰를 보여줍니다. */}
      {isListView ? (
        // "목록으로 보기" 뷰
        <div className={styles.list_method}>
          <div className={styles.info}>
            <div>조리순서🍳</div>
            <button onClick={handleToggleView}>하나씩 보기</button>
            {/* <div className={myingStyle["toggle-area"]}>
                <img src={lodingImg.toggleList} className={cx(myingStyle["toggle-icon"],myingStyle["listIcon"])}></img>
                <div className={myingStyle["slide"]}/>
                <img src={lodingImg.toggleGall} className={cx(myingStyle["toggle-icon"],myingStyle["gallery"])}></img>
            </div> */}
          </div>
          <hr />
          {/* mockSteps 배열을 map으로 순회하며 모든 단계를 렌더링합니다. */}
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
            <button onClick={handleToggleView}>목록으로 보기</button>
            {/* <div className={styles["toggle-area"]}>
                        <img src={styles.toggleList} className={cx(styles["toggle-icon"],styles["listIcon"])}></img>
                        <div className={styles["slide"]}/>
                        <img src={styles.toggleGall} className={cx(styles["toggle-icon"],styles["gallery"])}></img>
            </div> */}
          </div>
          <hr />
          <div className={styles.one_img}>
            <div className={styles.indicator}>
              <div className={styles.indicator_bar} style={{ width: `${indicatorWidth}%` }}></div>
            </div>
            <button className={`${styles.nav} ${styles.left}`} onClick={() => changeSlide(-1)}>◀</button>
            <div className={styles.slide}>
              <img src={currentStep.imageSrc} alt={`Step ${currentStep.order}`} height="510" width="510" />
            </div>
            <button className={`${styles.nav} ${styles.right}`} onClick={() => changeSlide(1)}>▶</button>
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