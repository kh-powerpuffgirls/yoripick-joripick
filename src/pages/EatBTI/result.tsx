import { useLocation, useNavigate } from "react-router-dom";
import style from "./eatbti.module.css";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { lodingImg } from "../../assets/images";
import { saveEatBTI  } from "../../api/eatbtiApi";
import { updateSikBti } from "../../features/authSlice";
import { useMemo, useState } from "react";

import Meat from '../../assets/eatBTI/육식티라노.png';
import Vegi from '../../assets/eatBTI/초식트리케라톱스.png';
import Sea from '../../assets/eatBTI/바다의연인.png';
import Brook from '../../assets/eatBTI/원X스브룩.png';
import BigMom from '../../assets/eatBTI/작지않은빅맘.png';
import Hangang from '../../assets/eatBTI/한강라면.png';
import Dopamine from '../../assets/eatBTI/도파민중독자.png';
import Hamster from '../../assets/eatBTI/잡식햄스터.png';


const descriptions: Record<string, string> = {
    "육식 티라노": "고기 없으면 인생도 없다. 고기 없으면 밥상 뒤엎는 타입!" +
        "“소고기? 닭고기? 아니 그냥 고기 주세요.”" +
        "고기 없으면 “나 오늘 밥 안 먹은 거임” 모드." +
        "쌈채소? 그건 고기 올리려고 있는 접시" +
        "“다이어트는 내일의 나에게 맡긴다.”",
    "초식 트리케라톱스": "채소 앞에선 눈빛 반짝. 고기 없어도 평온함 유지!" +
        "“상추가 곧 내 힐링스팟.”" +
        "사실 전생에 토끼였을지도...." +
        "“나 채소로도 행복할 수 있어 ✨”라고 외침." +
        "고기파 친구들 옆에서 마음의 평화를 찾는 자.",
    "바다의 연인": "회, 조개, 새우만 보면 광대 승천. 해물파전은 해물만 발라먹는 타입!" +
        "“내 피는 바닷물 농도랑 같다.”" +
        "해물파전에서 해물만 탈취하는 도둑손." +
        "회 한 접시 앞에서는 눈이 반짝 ✨" +
        "“내 피는 바닷물로 순환한다.”",
    "작지않은 빅맘": "치즈 폭탄, 버터 범벅, 튀김 바다에 뛰어드는 타입!" +
        "“내 혈관은 이미 크림수프다.”" +
        "치즈는 옵션이 아니라 기본세팅." +
        "튀김? 치즈? 버터? 삼위일체 완성." +
        "“칼로리는 배신하지 않는다.”",
    "원X스 브룩": "칼로리 계산기 켜두고 먹음. 닭가슴살+샐러드가 국룰!" +
        "“탄단지 비율 안 맞으면 밥상 파업.”" +
        "한 입 먹기 전 칼로리부터 스캔 🔍" +
        "군것질 대신 오이로 정신 승리." +
        "“0 칼로리 맞죠? 제 마음이 편하면 됐어요.”",
    "도파민 중독자": "강한 맛 아니면 노맛. 불닭+짜파게티+초콜릿 조합도 환영!" +
        "“인생은 자극적이어야 산다.”" +
        "라면 스프는 두 개가 국룰." +
        "혀는 행복하지만 위장은 울고 있다." +
        "“스트레스 풀 땐 맵단짠이 국룰이지.”",
    "한강라면": "간 안 한 게 진리. 미묘한 담백함에 감동받는 타입!" +
        "“나트륨아, 우리 서로 거리 두자.”" +
        "음식 나오자마자 “혹시 물 좀 주실래요?”" +
        "간 센 음식 먹으면 바로 몸이 SOS." +
        "“담백 is the new 힙.”",
    "잡식 햄스터": "고기파·채식파·해산물파 전쟁에도 미소 유지. 메뉴 전쟁 종결자!" +
        "“다 시켜, 내가 다 먹어줄게.”" +
        "뭐 먹을래? → “다 괜찮아~” 자동 대답." +
        "채소, 고기, 해산물 다 흡수하는 만능형." +
        "“음식판 인싸, 메뉴 고민 없는 게 장점.”",
};
const bgMap: Record<string, string> = {
  "육식 티라노": Meat,
  "초식 트리케라톱스": Vegi,
  "바다의 연인": Sea,
  "작지않은 빅맘": BigMom,
  "원X스 브룩": Brook,
  "도파민 중독자": Dopamine,
  "한강라면": Hangang,
  "잡식 햄스터": Hamster,
};

const ResultPage = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const dbValue: string = (location.state as any)?.dbValue;
    const description = dbValue ? descriptions[dbValue] : "결과 계산 중...";
    

    const [isSaved, setIsSaved] = useState(false);

    if (!dbValue) return <div>결과 계산 중...</div>;

    const bgImage = useMemo(() => bgMap[dbValue], [dbValue]);

    const handleSaveResult = async () => {
        if (isSaved) return; 

        if (user && dbValue) {
            try {
                await saveEatBTI(user.userNo, dbValue);
                dispatch(updateSikBti(dbValue));
                setIsSaved(true);
                alert("결과가 저장되었습니다!");
            } catch (err) {
                console.error(err);
                alert("저장 실패...");
            }
        } else {
            alert("사용자 정보가 없습니다. 저장할 수 없습니다.");
        }
    };

    return (
        <div>
            <div className={style.ebti_header}>
                <img
                    className={style.ebti_logo}
                    src={lodingImg.EatBtiLogo}
                    alt="EBTI Logo"
                />
            </div>

            <div
                className={style.result}
            >
                <span style={{ fontWeight: "bold", fontSize: "40px" }}>
                    {user? user?.username : "작성자"}님의 결과는?
                </span>
            </div>
            <div className={style.ebti_container_R}
                 style={{
                    backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                 }}
                 >

                <div
                    className={style.card}
                    style={{ backgroundColor: "#f5ea97ff", cursor: "pointer" }}
                    onClick={() => navigate("/eatBTI")}
                >
                    <span> ▶ 다시 테스트하기</span>
                </div>
                {(user !== null) &&
                   <div
                        className={style.card}
                        style={{ backgroundColor: "#f5ea97ff", cursor: "pointer" }}
                        onClick={handleSaveResult}
                    >
                        <span> ▶ 결과 저장하기</span>
                    </div>
                }
            </div>
        </div>
    );
};

export default ResultPage;
