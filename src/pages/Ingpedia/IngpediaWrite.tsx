import { Link } from "react-router-dom";
import { ingBn, lodingImg } from "../../assets/images";
import ingWriteStyle from "./IngpediaWrite.module.css"
import "../../assets/button.css"
import cx from "classnames";

export default function IngpediaWrite(){ 

    const ingCodeName = ['대분류명','과일', '채소', '버섯류', '곡류', '육류', '수산물', '유제품', '견과류', '당류', '양념류', '분말류', '기타'];
    const ingContent = ['단감aaaaaaaaaaaaaaaaaaaaaaaaaaaa', '연시', '감말랭이', '곶감', '구아바', '한라봉', '천혜향', '레드향', '황금향', '금귤', '다래', '대추', '건대추', '건대추야자', '두리안', '설향딸기', '딸기', '라임', '레몬', '롱안', '리치', '망고', '애플망고', '매실', '매실 당절임', '염장 매실', '머루', '머스켓베일리에이', '왕머루', '감로멜론', '머스크멜론', '모과', '무화과', '바나나', '배', '배 과즙', '버찌', '복분자', '백도복숭아', '천도복숭아'];

    return (
        <>
            <div className={ingWriteStyle.container}>
                <section className={ingWriteStyle["ing-detail"]}>
                    <div className={ingWriteStyle[`title-area`]}>
                        <div className="flex-row gap-10">
                            <h2>재료 관리</h2>
                            <h2>&gt;</h2>
                            <h2>등록하기</h2>
                        </div>
                    </div>
                    <hr/>
                    <div className={cx(ingWriteStyle["content-area"], ingWriteStyle["ing-detail-section"])}>
                        <table className={ingWriteStyle["ing-table"]}>
                            <thead>
                                <th colSpan={2}>
                                    <input name="ingName" type="text" className={ingWriteStyle["ing-name"]} placeholder="재료명"/>
                                </th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={2} className={ingWriteStyle["ing-image"]}>
                                        <img src={lodingImg.plus}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>분류</td>
                                    <td>
                                        <select name="ingCodeName" className={ingWriteStyle["drop-menu"]}>
                                            {ingCodeName.map(
                                                (item, index) => (
                                                    <option value={index} className={ingWriteStyle["drop-item"]}>{item}</option>
                                                )
                                            )}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>열량</td>
                                    <td className={ingWriteStyle["input-area"]}>
                                        <input name="ingEnergy" type="number" placeholder="0"/>
                                        <span>kcal</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>탄수화물</td>
                                    <td className={ingWriteStyle["input-area"]}>
                                        <input name="ingCarb" type="number" placeholder="0"/>
                                        <span>g</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>단백질</td>
                                    <td className={ingWriteStyle["input-area"]}>
                                        <input name="ingProtein" type="number" placeholder="0"/>
                                        <span>g</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>지방</td>
                                    <td className={ingWriteStyle["input-area"]}>
                                        <input name="ingFat" type="number" placeholder="0"/>
                                        <span>g</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>나트륨</td>
                                    <td className={ingWriteStyle["input-area"]}>
                                        <input name="ingSodium" type="number" placeholder="0"/>
                                        <span>g</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className={ingWriteStyle["tip-area"]}>
                            <h3>보관법 (Storage Method)</h3>
                            <textarea name="storage" placeholder="보관법을 입력하세요."/>
                            <h3>손질법 (Preparation / Handling)</h3>
                            <textarea name="preparation" placeholder="손질법을 입력하세요."/>
                            <h3>적정 보관 기한 (Shelf Life)</h3>
                            <textarea name="life" placeholder="적정 보관 기한을 입력하세요."/>
                            <h3>활용 팁 (Usage Tip)</h3>
                            <textarea name="tip" placeholder="활용 팁을 입력하세요."/>
                        </div>
                    </div>
                </section>
                <hr/>
                {/* <!-- 궁합 --> */}
                <section className={cx(ingWriteStyle["ing-match-section"])}>
                    <div className={ingWriteStyle["best-area"]}>
                        <h3>Best 궁합</h3>
                            <div className={cx("flex-row", ingWriteStyle["match-content"])}>
                                <img src={lodingImg.thumbUp}/>
                                <span className={ingWriteStyle["btn-group"]}>
                                    <button className={cx("click-basic", "round-btn", "green", ingWriteStyle["ing-btn"])}>재료1</button>
                                    <button className={cx("icon-btn", "green-b")}>+</button>
                                </span>
                            </div>
                    </div>
                    <div className={ingWriteStyle["vt-line"]}/>
                    <div className={ingWriteStyle["worst-area"]}>
                        <h3>Worst 궁합</h3>
                            <div className={cx("flex-row", ingWriteStyle["match-content"])}>
                                <span className={ingWriteStyle["btn-group"]}>
                                    <button className={cx("click-basic", "round-btn", "orange", ingWriteStyle["ing-btn"])}>재료1</button>
                                    <button className={cx("click-basic", "round-btn", "orange", ingWriteStyle["ing-btn"])}>재료2</button>
                                    <button className={cx("icon-btn", "orange-b")}>+</button>
                                </span>
                                <img src={lodingImg.thumbDown}/>
                            </div>
                    </div>
                </section>
                
                <section className={ingWriteStyle["admin-section"]}>
                    <hr/>
                    <div className={cx("flex-row", "gap-20", "center")}>
                        <button className={cx("click-basic", "semi-round-btn", "olive")}>등록</button>
                    </div>
                </section>
            </div>
        </>
    )
}