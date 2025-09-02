// src/components/Sidebar.tsx
import React from 'react';
import sidebar from'./CommunitySideber.module.css'; // Sidebar 전용 CSS (기존 CSS에서 .sidebar 부분 분리)

const CommunitySidebar: React.FC = () => {
    // 여기에 재료 추가, 체크박스 선택 등 상태 관리 로직이 추가될 예정
  return (
    <div className={sidebar.sidebar}>
      <h1>정렬조건</h1>
      <div id={sidebar.box}>
        <label className={sidebar.sidebar_title}>재료</label>
        <div className={sidebar.input_container}>
          <input type="text" placeholder="예: 감자" />
        </div>
        <div className={sidebar.tag_box}>
          <span className={sidebar.tag}>감자 <button>&times;</button></span>
        </div>
      </div>
      <div id={sidebar.box}>
        <div className={sidebar.sidebar_title}>요리방법</div>
        <hr />
        <div className={sidebar.checkbox_group}>
          <label><input type="checkbox" defaultChecked /> 전체</label>
          <label><input type="checkbox" /> 굽기</label>
          {/* ... 나머지 체크박스 ... */}
        </div>
      </div>
      <div id={sidebar.box}>
        <div className={sidebar.sidebar_title}>요리종류</div>
        <hr />
        <div className={sidebar.checkbox_group}>
          <label><input type="checkbox" defaultChecked /> 전체</label>
          <label><input type="checkbox" /> 반찬</label>
          {/* ... 나머지 체크박스 ... */}
        </div>
        <button className={sidebar.submit_button}>조회</button>
      </div>
    </div>
  );
};

export default CommunitySidebar;