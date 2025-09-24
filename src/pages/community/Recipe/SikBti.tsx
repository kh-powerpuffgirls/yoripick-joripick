import React from 'react';

// 컴포넌트가 받을 props의 타입을 정의합니다.
interface SikBtiProps {
  sikBti: string;
  style?: React.CSSProperties;
}

// ✨ 컴포넌트 이름은 대문자로 시작하는 것이 React의 규칙입니다. (sikBti -> SikBti)
const SikBti: React.FC<SikBtiProps> = ({ sikBti,style }) => {
  // 값에 따라 색상 지정
  const getColor = (bti: string) => {
    switch (bti) {
      case '육식티라노': return '#FF7C7C';
      case '초식 트리케라톱스': return '#92CA02';
      case '바다의 연인': return '#2B90CE';
      case '칼로리 스나이퍼': return '#0902CA';
      case '열량 폭주기관차': return '#CA0202';
      case '슴슴슴슴': return '#40E0D0';
      case '도파민 중독자': return '#FD5CA8';
      case '푸드 간디': return '#FF6600';
      default: return 'gray'; // 기본값
    }
  };
  
  return (
    <div
      style={{
        color: getColor(sikBti),
        fontWeight: '600',
        ...style
      }}
    >
      {sikBti}
    </div>
  );
};

export default SikBti;