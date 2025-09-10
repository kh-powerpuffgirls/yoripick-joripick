import { Link } from "react-router-dom";
import { lodingImg } from "../../assets/images";
import MyIngWriteStyle from "./MyIngWrite.module.css"
import "../../assets/button.css"
import cx from "classnames";

export default function MyIngWrite(){

    const ingCodeName = ['전체','과일', '채소', '버섯류', '곡류', '육류', '수산물', '유제품', '견과류', '당류', '양념류', '분말류', '기타'];
    const ingContent = ['단감aaaaaaaaaaaaaaaaaaaaaaaaaaaa', '연시', '감말랭이', '곶감', '구아바', '한라봉', '천혜향', '레드향', '황금향', '금귤', '다래', '대추', '건대추', '건대추야자', '두리안', '설향딸기', '딸기', '라임', '레몬', '롱안', '리치', '망고', '애플망고', '매실', '매실 당절임', '염장 매실', '머루', '머스켓베일리에이', '왕머루', '감로멜론', '머스크멜론', '모과', '무화과', '바나나', '배', '배 과즙', '버찌', '복분자', '백도복숭아', '천도복숭아'];

    return (
        <>
            <div className={MyIngWriteStyle.container}>
                <section className={MyIngWriteStyle["ing-detail"]}>
                    <div className={MyIngWriteStyle[`title-area`]}>
                        <div className="flex-row gap-10">
                            <h2>내 식재료 관리</h2>
                            <h2>&gt;</h2>
                            <h2>상세보기</h2>
                        </div>
                    </div>
                    <div className={MyIngWriteStyle[`title-area`]}>
                        <h3>새 재료</h3>
                        <hr className={MyIngWriteStyle["gray"]}/>
                    </div>
                    <div className={cx(MyIngWriteStyle["content-area"], MyIngWriteStyle["ing-detail-section"])}>
                        
                        <div className={MyIngWriteStyle["thumbnail"]}>
                            <img src={lodingImg.plus} className={MyIngWriteStyle["add-img"]}/>
                            {/* <img src={lodingImg.noImage} className={MyIngWriteStyle["thumbnail-img"]}/> */}
                        </div>
                        <section className={MyIngWriteStyle["ing-inform"]}>
                            <select name="ingCodeName" className={MyIngWriteStyle["drop-menu"]}>
                                {ingCodeName.map(
                                    (item, index) => (
                                        <option value={index} className={MyIngWriteStyle["drop-item"]}>{item}</option>
                                    )
                                )}
                            </select>
                            <input type="text" value={"재료명"} className={MyIngWriteStyle["ing-name"]}/>
                            <div className={MyIngWriteStyle["sub-inform"]}>
                                <h3>수량 / 무게</h3><input type="text" value={"0"} className={MyIngWriteStyle["ing-quantity"]} name="quantity"/>
                                <h3>등록일</h3>
                                <input type="date" value={"2025-09-01"} className={MyIngWriteStyle["ing-regidate"]} name="regidate"></input>
                                <h3>소비기한</h3>
                                <input type="date" value={"2025-09-01"} className={MyIngWriteStyle["ing-usedate"]} name="usedate"/>
                            </div>
                        </section>
                    </div>
                    <section className={MyIngWriteStyle["btn-group"]}>
                        <div className={cx("flex-row", "gap-20", "center")}>
                            <button className={cx("click-basic", "semi-round-btn", "olive")}>등록</button>
                            <button className={cx("click-basic", "semi-round-btn", "red")}>취소</button>
                        </div>
                    </section>
                </section>
                <hr/>


            </div>
        </>
    )
}