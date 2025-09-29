import { useNavigate } from "react-router-dom";
import style from "./eatbti.module.css";
import EatBTIHeader from "./eatbti_header";
import main from "../../../public/assets/images/eatBTI/eatBTI_main.png";

const EatBTIPage = () => {
  const navigate = useNavigate();
  return (
    <div className={style.main}>
      < EatBTIHeader />
      <div className={style.ebti_container}
           style={{ backgroundImage: `url(${main})` }}>
        <div className={style.card}
          onClick={() => navigate("/eatBTI/question")}
          id={style.testStart}
          style={{ backgroundColor: "#86BA6C", cursor: "pointer", border:"1px solid #174421"}}>
          <span> ▶ 테스트 시작하기</span>
        </div>
      </div>
    </div>
  );
};

export default EatBTIPage;
