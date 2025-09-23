import { useLocation, useNavigate } from "react-router-dom";
import style from "./eatbti.module.css";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useEffect, useState } from "react";
import { codeToDBString } from "./question";

const descriptions: Record<string, string> = {
    M: "고기 없으면 인생도 없다. 고기 없으면 밥상 뒤엎는 타입!" +
        "“소고기? 닭고기? 아니 그냥 고기 주세요.”" +
        "고기 없으면 “나 오늘 밥 안 먹은 거임” 모드." +
        "쌈채소? 그건 고기 올리려고 있는 접시" +
        "“다이어트는 내일의 나에게 맡긴다.”",
    V: "채소 앞에선 눈빛 반짝. 고기 없어도 평온함 유지!" +
        "“상추가 곧 내 힐링스팟.”" +
        "사실 전생에 토끼였을지도...." +
        "“나 채소로도 행복할 수 있어 ✨”라고 외침." +
        "고기파 친구들 옆에서 마음의 평화를 찾는 자.",
    S: "회, 조개, 새우만 보면 광대 승천. 해물파전은 해물만 발라먹는 타입!" +
        "“내 피는 바닷물 농도랑 같다.”" +
        "해물파전에서 해물만 탈취하는 도둑손." +
        "회 한 접시 앞에서는 눈이 반짝 ✨" +
        "“내 피는 바닷물로 순환한다.”",
    K: "치즈 폭탄, 버터 범벅, 튀김 바다에 뛰어드는 타입!" +
        "“내 혈관은 이미 크림수프다.”" +
        "치즈는 옵션이 아니라 기본세팅." +
        "튀김? 치즈? 버터? 삼위일체 완성." +
        "“칼로리는 배신하지 않는다.”",
    T: "간 안 한 게 진리. 미묘한 담백함에 감동받는 타입!" +
        "“나트륨아, 우리 서로 거리 두자.”" +
        "음식 나오자마자 “혹시 물 좀 주실래요?”" +
        "간 센 음식 먹으면 바로 몸이 SOS." +
        "“담백 is the new 힙.”",
};

const ResultPage = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const location = useLocation();
    const [dbValue, setDbValue] = useState<string | null>(null);
    const [top, setTop] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.sikBti) {
            setDbValue(user.sikBti);
            const code = Object.entries(codeToDBString).find(([, val]) => val === user.sikBti)?.[0];
            setTop(code || null);
        } else if (location.state?.dbValue && location.state?.top) {
            setDbValue(location.state.dbValue);
            setTop(location.state.top);
        }
    }, [user, location.state]);

    if (!dbValue) return <div>결과 계산 중...</div>;

    return (
        <div>
            <div className={style.ebti_header}>
                <img
                    className={style.ebti_logo}
                    src="../../assets/sample/image-removebg-preview.png"
                    alt="EBTI Logo"
                />
            </div>
            <div className={style.ebti_container}>
                <div
                    className={style.card}
                    style={{ backgroundColor: "#FFF185", height: "400px" }}
                >
                    <span style={{ fontWeight: "bold", fontSize: "40px" }}>
                        당신의 결과는?
                    </span>
                    <br />
                    <span style={{ fontSize: "30px" }}>{dbValue}</span>
                    <br />
                    <span>{top && descriptions[top] || "아직 결과가 없습니다."}</span>
                </div>
                <div
                    className={style.card}
                    style={{ backgroundColor: "#FFD0BF", cursor: "pointer" }}
                    onClick={() => navigate("/eatBTI")}
                >
                    <span> ▶ 다시 테스트하기</span>
                </div>
            </div>
        </div>
    );
};

export default ResultPage;
