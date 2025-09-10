import { Link } from "react-router-dom";
import { lodingImg } from "../../assets/images";
import MyIngDetailStyle from "./MyIngDetail.module.css"
import "../../assets/button.css"
import cx from "classnames";

export default function MyIngDetail(){

    const ingCodeName = ['전체','과일', '채소', '버섯류', '곡류', '육류', '수산물', '유제품', '견과류', '당류', '양념류', '분말류', '기타'];
    const ingContent = ['단감aaaaaaaaaaaaaaaaaaaaaaaaaaaa', '연시', '감말랭이', '곶감', '구아바', '한라봉', '천혜향', '레드향', '황금향', '금귤', '다래', '대추', '건대추', '건대추야자', '두리안', '설향딸기', '딸기', '라임', '레몬', '롱안', '리치', '망고', '애플망고', '매실', '매실 당절임', '염장 매실', '머루', '머스켓베일리에이', '왕머루', '감로멜론', '머스크멜론', '모과', '무화과', '바나나', '배', '배 과즙', '버찌', '복분자', '백도복숭아', '천도복숭아'];

    return (
        <>
            <div className={MyIngDetailStyle.container}>
                <section className={MyIngDetailStyle["ing-detail"]}>
                    <div className={MyIngDetailStyle[`title-area`]}>
                        <div className="flex-row gap-10">
                            <h2>내 식재료 관리</h2>
                            <h2>&gt;</h2>
                            <h2>상세보기</h2>
                        </div>
                    </div>
                    <div className={MyIngDetailStyle[`title-area`]}>
                        <h3>과일(*카테고리명으로 수정해야 함*)</h3>
                        <hr className={MyIngDetailStyle["gray"]}/>
                    </div>
                    <div className={cx(MyIngDetailStyle["content-area"], MyIngDetailStyle["ing-detail-section"])}>
                        
                        <div className={MyIngDetailStyle["thumbnail"]}>
                            <img src={lodingImg.noImage} className={MyIngDetailStyle["thumbnail-img"]}/>
                            <img className={MyIngDetailStyle[`bang-icon`]} src={lodingImg.bang}/>
                            <div className={MyIngDetailStyle[`d-day`]}>D - 30</div>
                            <div>* 소비기한이 임박했습니다!</div>
                        </div>
                        <section className={MyIngDetailStyle["ing-inform"]}>
                            <select name="ingCodeName" className={MyIngDetailStyle["drop-menu"]}>
                                {ingCodeName.map(
                                    (item, index) => (
                                        <option value={index} className={MyIngDetailStyle["drop-item"]}>{item}</option>
                                    )
                                )}
                            </select>
                            <input type="text" value={"재료명"} className={MyIngDetailStyle["ing-name"]}/>
                            <div className={MyIngDetailStyle["sub-inform"]}>
                                <h3>수량 / 무게</h3><input type="text" value={"0"} className={MyIngDetailStyle["ing-quantity"]} name="quantity"/>
                                <h3>등록일</h3>
                                <input type="date" value={"2025-09-01"} className={MyIngDetailStyle["ing-regidate"]} name="regidate"></input>
                                <h3>소비기한</h3>
                                <input type="date" value={"2025-09-01"} className={MyIngDetailStyle["ing-usedate"]} name="usedate"/>
                            </div>
                        </section>
                    </div>
                    <section className={MyIngDetailStyle["btn-group"]}>
                        <div className={cx("flex-row", "gap-20", "center")}>
                            <button className={cx("click-basic", "semi-round-btn", "olive")}>수정</button>
                            <button className={cx("click-basic", "semi-round-btn", "red")}>삭제</button>
                        </div>
                    </section>
                </section>
                <hr/>







                {/* <!-- 관련 레시피 --> */}
                <section className={cx(MyIngDetailStyle["recipe-section"])}>
                    <div className={MyIngDetailStyle[`title-area`]}>
                        <h3>관련 레시피</h3>
                        <hr className={MyIngDetailStyle["gray"]}/>
                        <a href="#" className={MyIngDetailStyle[`more-link`]}>더보기</a>
                    </div>


                    <div className={cx(MyIngDetailStyle["content-area"])}>

                        <article className={MyIngDetailStyle["recipe-item"]}>
                            <div className={MyIngDetailStyle["thumbnail"]}>
                                <img src={lodingImg.noImage} className={MyIngDetailStyle["thumbnail-img"]}/>
                            </div>
                            <div className={MyIngDetailStyle["recipe-inform"]}>
                                <h3>레시피 제목이 들어가는 영역(줄바꿈 ...처리)ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ</h3>
                                <div>조리시간: 60분 이내</div>
                                <div>재료: 재료1, 재료2, 재료3....</div>
                            </div>
                        </article><article className={MyIngDetailStyle["recipe-item"]}>
                            <div className={MyIngDetailStyle["thumbnail"]}>
                                <img src={lodingImg.noImage} className={MyIngDetailStyle["thumbnail-img"]}/>
                            </div>
                            <div className={MyIngDetailStyle["recipe-inform"]}>
                                <h3>레시피 제목이 들어가는 영역(줄바꿈 ...처리)ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ</h3>
                                <div>조리시간: 60분 이내</div>
                                <div>재료: 재료1, 재료2, 재료3....</div>
                            </div>
                        </article>

                    </div>
                </section>
                

            </div>
        </>
    )
}