import { useNavigate } from "react-router-dom";
import style from "./eatbti.module.css";
import EatBTIHeader from "./eatbti_header";

const EatBTIPage = () => {
  const navigate = useNavigate();
  return (
    <div className={style.main}>
      < EatBTIHeader />
      <div className={style.ebti_container}>
        <div
          className={style.card}
          style={{ backgroundColor: "#FFF185", height: "400px" }}
        >
          <span style={{ fontWeight: "bold", fontSize: "40px" }}>
            식BTI 유형테스트
          </span>
          <br />
          <span>당신의 식습관유형을 알아보세요!</span>
        </div>
        <div className={style.card}
          onClick={() => navigate("/eatBTI/question")}
          style={{ backgroundColor: "#FFD0BF", cursor: "pointer" }}>
          <span> ▶ 테스트 시작하기</span>
        </div>
      </div>
    </div>
  );
};

export default EatBTIPage;
