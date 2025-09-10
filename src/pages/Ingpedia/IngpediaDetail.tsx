import { Link } from "react-router-dom";
import { lodingImg } from "../../assets/images";
import ingDetailStyle from "./IngpediaDetail.module.css"
import "../../assets/button.css"
import cx from "classnames";

export default function IngpediaDetail(){

    const ingCodeName = ['전체','과일', '채소', '버섯류', '곡류', '육류', '수산물', '유제품', '견과류', '당류', '양념류', '분말류', '기타'];
    const ingContent = ['단감aaaaaaaaaaaaaaaaaaaaaaaaaaaa', '연시', '감말랭이', '곶감', '구아바', '한라봉', '천혜향', '레드향', '황금향', '금귤', '다래', '대추', '건대추', '건대추야자', '두리안', '설향딸기', '딸기', '라임', '레몬', '롱안', '리치', '망고', '애플망고', '매실', '매실 당절임', '염장 매실', '머루', '머스켓베일리에이', '왕머루', '감로멜론', '머스크멜론', '모과', '무화과', '바나나', '배', '배 과즙', '버찌', '복분자', '백도복숭아', '천도복숭아'];

    return (
        <>
            <div className={ingDetailStyle.container}>
                <section className={ingDetailStyle["ing-detail"]}>
                    <div className={ingDetailStyle[`title-area`]}>
                        <div className="flex-row gap-10">
                            <h2>재료 관리</h2>
                            <h2>&gt;</h2>
                            <h2>상세보기</h2>
                        </div>
                    </div>
                    <hr/>
                    <div className={cx(ingDetailStyle["content-area"], ingDetailStyle["ing-detail-section"])}>
                        <table className={ingDetailStyle["ing-table"]}>
                            <thead>
                                <th colSpan={2}>*재료명*</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={2} className={ingDetailStyle["ing-image"]}>
                                        <img src={lodingImg.noImage}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>분류</td>
                                    <td>*카테고리*</td>
                                </tr>
                                <tr>
                                    <td>열량</td>
                                    <td>*00kcal*</td>
                                </tr>
                                <tr>
                                    <td>탄수화물</td>
                                    <td>*00g*</td>
                                </tr>
                                <tr>
                                    <td>단백질</td>
                                    <td>*00g*</td>
                                </tr>
                                <tr>
                                    <td>지방</td>
                                    <td>*00g*</td>
                                </tr>
                                <tr>
                                    <td>나트륨</td>
                                    <td>*00mg*</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className={ingDetailStyle["tip-area"]}>
                            <h3>보관법 (Storage Method)</h3>
                            <div>보관법 설명이 없습니다.보관법 설명이 없습니다.보관법 설명이 없습니다.보관법 설명이 없습니다.보관법 설명이 없습니다.보관법 설명이 없습니다.보관법 설명이 없습니다.보관법 설명이 없습니다.보관법 설명이 없습니다.</div>
                            <h3>손질법 (Preparation / Handling)</h3>
                            <div>손질법 설명이 없습니다.</div>
                            <h3>적정 보관 기한 (Shelf Life)</h3>
                            <div>적정 보관 기한 설명이 없습니다.</div>
                            <h3>활용 팁 (Usage Tip)</h3>
                            <div>활용 팁이 없습니다.</div>
                        </div>
                    </div>
                </section>
                <hr/>
                {/* <!-- 궁합 --> */}
                <section className={cx(ingDetailStyle["ing-match-section"])}>
                    <div className={ingDetailStyle["best-area"]}>
                        <h3>Best 궁합</h3>
                            <div className={cx("flex-row", ingDetailStyle["match-content"])}>
                                <img src={lodingImg.thumbUp}/>
                                <span className={ingDetailStyle["btn-group"]}>
                                    <button className={cx("click-basic", "round-btn", "green")}>재료1</button>
                                    <button className={cx("click-basic", "round-btn", "green")}>재료2</button>
                                </span>
                            </div>
                    </div>
                    <div className={ingDetailStyle["vt-line"]}/>
                    <div className={ingDetailStyle["worst-area"]}>
                        <h3>Worst 궁합</h3>
                            <div className={cx("flex-row", ingDetailStyle["match-content"])}>
                                <span className={ingDetailStyle["btn-group"]}>
                                    <button className={cx("click-basic", "round-btn", "orange")}>재료1</button>
                                    <button className={cx("click-basic", "round-btn", "orange")}>재료2</button>
                                    <button className={cx("click-basic", "round-btn", "orange")}>재료3</button>
                                </span>
                                <img src={lodingImg.thumbDown}/>
                            </div>
                    </div>
                </section>
                
                <section className={ingDetailStyle["admin-section"]}>
                    <hr/>
                    <div className={cx("flex-row", "gap-20", "center")}>
                        <button className={cx("click-basic", "semi-round-btn", "olive")}>수정</button>
                        <button className={cx("click-basic", "semi-round-btn", "red")}>삭제</button>
                    </div>
                </section>
            </div>
        </>
    )
}