import './CommunitySideber.css';

export default function CommunitySidebar(){
    
    return(
        <>
            {/* 사이드 바  */}
            <div className="sidebar">
                <h1>정렬조건</h1>
                <div id="box">
                    <label className="sidebar_title">재료</label>
                    <div className="input-container">
                        <input type="text" placeholder="예: 감자" />
                    </div>
        
                    {/* 선택된 재료 */}
                    <div className="tag-box">
                        <span className="tag">감자 <button>&times;</button></span>
                    </div>
                </div>
                <div id="box">
                    <div className="sidebar_title">요리방법</div>
                    <hr/>
                    <div className="checkbox-group">
                        <label><input type="checkbox" checked /> 전체</label>
                        <label><input type="checkbox" /> 굽기</label>
                        <label><input type="checkbox" /> 부침</label>
                        <label><input type="checkbox" /> 찜</label>
                        <label><input type="checkbox" /> 볶음</label>
                        <label><input type="checkbox" /> 무치기</label>
                        <label><input type="checkbox" /> 끓이기</label>
                        <label><input type="checkbox" /> 데우기</label>
                    </div>
                </div>
                <div id="box">
                    <div className="sidebar_title">요리종류</div>
                    <hr/>
                    <div className="checkbox-group">
                        <label><input type="checkbox" checked /> 전체</label>
                        <label><input type="checkbox" /> 반찬</label>
                        <label><input type="checkbox" /> 밥/죽/떡</label>
                        <label><input type="checkbox" /> 국/탕</label>
                        <label><input type="checkbox" /> 양념</label>
                        <label><input type="checkbox" /> 빵</label>
                        <label><input type="checkbox" /> 장류</label>
                    </div>
                    <button className="submit-button">조회</button>
                </div>
        
            </div>
        </>
    )
}