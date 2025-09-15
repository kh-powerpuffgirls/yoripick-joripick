import React from 'react';


export const colortype = ({ sikBti }) => {
  // 값에 따라 색상 지정
  const getColor = (sikBti) => {
    switch (sikBti) {
      case '육식티라노':
        return '#FF7C7C';
      case '초식 트리케라톱스':
        return '#92CA02';
      case '바다의 연인':
        return '#2B90CE';
      case '칼로리 스나이퍼':
        return '#0902CA';
      case '열량 폭주기관차':
        return '#CA0202';
      case '슴슴슴슴':
        return '#40E0D0';
      case '도파민 중독자':
        return '#FD5CA8';
      case '푸드 간디':
        return '#FF6600';
      default:
        return 'gray';
    }
  };

  return (
    <div
      style={{
        backgroundColor: getColor(sikBti),
        padding: '10px',
        color: 'white',
        borderRadius: '5px',
        textAlign: 'center',
      }}
    >
      값: {sikBti}
    </div>
  );
};

export default colortype;

// <colortype value={1} />이렇게 사용
