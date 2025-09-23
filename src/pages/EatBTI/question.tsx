import { useEffect, useState } from "react";
import style from "./eatbti.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { updateSikBti } from "../../features/authSlice";
import { saveEatBTI } from "../../api/eatbtiApi";

interface Question {
    id: number;
    text: string;
    options: string[];
}

const questions: Question[] = [
    {
        id: 1,
        text: "고깃집에 갔을 때 제일 먼저 찾는 건?",
        options: ["🥩 삼겹살", "🥗 쌈채소", "🐙 오징어볶음", "🥤 물"],
    },
    {
        id: 2,
        text: "샐러드를 볼 때 나는?",
        options: ["🥗 메인으로 충분", "🥩 고기 곁들이면 좋다", "🍟 감튀랑 먹으면", "❌ 필요 없음"],
    },
    {
        id: 3,
        text: "좋아하는 국물 맛은?",
        options: ["🌊 해물탕", "🧂 칼칼짭짤", "🥔 맑은 국", "🍲 사골국"],
    },
    {
        id: 4,
        text: "배달 앱에서 제일 많이 시키는 음식은?",
        options: ["🍔 햄버거/치킨", "🍣 초밥/회", "🥗 샐러드", "🍲 찌개/백반"],
    },
    {
        id: 5,
        text: "외식할 때 제일 신경 쓰는 건?",
        options: ["칼로리", "양념 세기", "신선도", "질과 양"],
    },
    {
        id: 6,
        text: "아침 식사 스타일은?",
        options: ["🍞 빵/커피", "🍚 밥/반찬", "🥗 과일/요거트", "❌ 안 먹음"],
    },
    {
        id: 7,
        text: "치즈 듬뿍 피자, 내 반응은?",
        options: ["🤤 무조건 좋아!", "🧂 간 너무 세", "🥗 샐러드랑", "❌ 해산물피자"],
    },
    {
        id: 8,
        text: "내가 스트레스 받을 때 찾는 음식은?",
        options: ["🍗 치킨/피자", "🍜 매운 라면", "🥗 과일/샐러드", "🍣 초밥"],
    },
    {
        id: 9,
        text: "다이어트를 결심했을 때 가장 먼저 줄이는 건?",
        options: ["🍩 디저트", "🍖 고기", "🍜 짠 음식", "🍣 회"],
    },
    {
        id: 10,
        text: "여행지에서 먹고 싶은 음식은?",
        options: ["🥩 현지 고기", "🐟 해산물", "🥗 채소", "🍲 향신료 강한 음식"],
    },
    {
        id: 11,
        text: "내가 선호하는 간식은?",
        options: ["🍫 디저트", "🍎 사과/견과", "🍟 감튀/과자", "🥒 오이/당근"],
    },
    {
        id: 12,
        text: "외식할 때 “맛집 선택 기준”은?",
        options: ["🍴 건강식", "🧂 간 강한 집", "🐙 신선한 재료", "🥩 고기 퀄리티"],
    },
    {
        id: 13,
        text: "편의점에서 자주 고르는 건?",
        options: ["🍙 삼각김밥", "🥗 샐러드", "🍜 컵라면", "🍫 디저트"],
    },
    {
        id: 14,
        text: "“밥 없이는 못 살아~”라는 말에 나는?",
        options: ["👍 고기랑 밥 필수", "🤔 샐러드 선호", "🍣 해산물과 곁들임", "❌ 밥 안 먹어도"],
    },
    {
        id: 15,
        text: "가장 잘 어울리는 술안주는?",
        options: ["🍢 삼겹살, 닭발", "🐙 회, 조개구이", "🥗 샐러드, 과일", "🍟 치킨, 감튀"],
    },
];

export const codeToDBString: Record<string, string> = {
    M: "육식 티라노",
    V: "초식 트리케라톱스",
    S: "바다의 연인",
    K: "열량 폭주기관차",
    T: "슴슴슴슴",
};

const QuestionPage = () => {
    const [current, setCurrent] = useState(0);
    const [scoreMap, setScoreMap] = useState<any[]>([]);
    const [scores, setScores] = useState<Record<string, number>>({});
    const user = useSelector((state: any) => state.auth.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        axios.get("http://localhost:8081/sbti")
            .then(res => setScoreMap(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleAnswer = (optionIdx: number) => {
        const qid = questions[current].id;

        const rules = scoreMap.filter(
            (item: any) => item.questionNo === qid && item.optionNo === optionIdx + 1
        );
        if (rules.length === 0) {
            console.warn(`점수 규칙이 존재하지 않습니다: questionNo=${qid}, optionNo=${optionIdx}`);
        }
        const newScores = { ...scores };

        rules.forEach((r: any) => {
            newScores[r.types] = (newScores[r.types] || 0) + r.score;
        });
        setScores(newScores);

        if (current < questions.length - 1) {
            setCurrent(current + 1);
        } else {
            const sorted = Object.entries(newScores).sort((a, b) => b[1] - a[1]);
            const top = sorted.length > 0 ? sorted[0][0] : "?";
            const dbValue = codeToDBString[top];
            if (user) {
                try {
                    saveEatBTI(user.userNo, dbValue);
                    dispatch(updateSikBti(dbValue));
                    navigate("/eatBTI/result");
                } catch (err) {
                    console.error(err);
                    alert("저장 실패...");
                }
            } else {
                navigate("/eatBTI/result", { state: { dbValue, top } });
            }
        }
    };

    return (
        <div>
            <div className={style.ebti_header}>
                <img
                    className={style.ebti_logo}
                    src="../../assets/sample/image-removebg-preview.png"
                    alt="EBTI Logo"
                />
            </div>
            <div className={style.pagging}>
                <div id="now">
                    {current + 1} / {questions.length}
                </div>
            </div>
            <div className={style.ebti_container}>
                <div className="Q">
                    <span style={{ fontSize: "50px", fontWeight: "bold" }}>
                        Q{questions[current].id}
                    </span>
                    <div
                        className={style.card}
                        style={{ backgroundColor: "#FFD0BF", height: "400px" }}
                    >
                        <span style={{ fontWeight: "bold", fontSize: "40px" }}>
                            {questions[current].id}. {questions[current].text}
                        </span>
                    </div>
                </div>
                {questions[current].options.map((opt, idx) => (
                    <div
                        key={idx}
                        className={style.card}
                        onClick={() => handleAnswer(idx)}
                        style={{ cursor: "pointer" }}
                    >
                        {opt}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionPage;
