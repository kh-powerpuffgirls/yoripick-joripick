import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "./MyPage.module.css";
import kakaoLogo from "./kakaologo.png";

import ProfileModal from "../../components/MyPage/ProfileModal";
import AllergyModal from "../../components/MyPage/AllergyModal";
import MemberInfoModal from "../../components/MyPage/MemberInfoModal";
import AlarmModal from "../../components/MyPage/AlarmModal";

import type { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";
import defaultProfile from "./defaultprofile.png"
import InactiveModal from "../../components/MyPage/InactiveModal";
import { updateProfileImage } from "../../features/authSlice";

const MyPage = () => {
    const [isProfileModal, setProfileModal] = useState(false);
    const [isAllergyModal, setAllergyModal] = useState(false);
    const [isMemberInfoModal, setMemberInfoModal] = useState(false);
    const [isAlarmModal, setAlarmModal] = useState(false);
    const [isInactiveModal, setInactiveModal] = useState(false);
    const dispatch = useDispatch();
    const [allergyInfo, setAllergyInfo] = useState<string[]>([]);
    const [myRecipes, setMyRecipes] = useState<
        { id: number; title: string; likes: number; img: string }[]
    >([]);

    const handleUpdateProfile = (newUrl: string) => {
        dispatch(updateProfileImage(newUrl));
    };
    const user = useSelector((state: RootState) => state.auth.user);
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const navigate = useNavigate();
    const handleInactive = async () => {
        if (!user) return;

        try {
            // 회원 탈퇴 API 호출
            await axios.post(
                `http://localhost:8081/users/${user.userNo}/inactive`,
                {},
                { withCredentials: true }
            );

            // 쿠키삭제 구현하거나 logout API 호출해서 쿠키삭제유도(추후에 작성할 예정 일단 MyPage의 다른 기능부터 만들고 돌아오자)

            alert("회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다 🙏");
            navigate("/");
        } catch (err) {
            console.error("회원 탈퇴 실패:", err);
            alert("회원 탈퇴 처리 중 오류가 발생했습니다.");
        }
    };

    useEffect(() => {
        if (!user || !accessToken) return;

        const api = axios.create({
            baseURL: "http://localhost:8081/mypage",
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const fetchData = async () => {
            try {
                const recipeRes = await api.get(`/users/${user.userNo}/recipes`);
                setMyRecipes(recipeRes.data);

                const allergyRes = await api.get(`/users/${user.userNo}/allergies`);
                setAllergyInfo(allergyRes.data);
            } catch (err) {
                console.error("마이페이지 데이터 불러오기 오류:", err);
            }
        };

        fetchData();
    }, [user, accessToken]);

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <button
                    className={styles.inactiveBtn}
                    onClick={() => setInactiveModal(true)}
                >
                    회원탈퇴
                </button>
            </div>
            {user && (
                <section className={styles.profileSection}>
                    <div className={styles.leftProfile}>
                        <img
                            src={user.profile || defaultProfile}
                            className={styles.profileImg}
                        />
                    </div>

                    <div className={styles.profileInfo}>
                        {/* <div className={styles.sikbti}>{user.sikbti}</div> */}
                        <div className={styles.nameRow}>
                            <h2 className={styles.username}>{user.username}</h2>
                            <span className={styles.email}>&nbsp;({user.email})</span>
                            {user.provider === "kakao" && (
                                <img src={kakaoLogo} alt="kakao logo" className={styles.socialLogo} />
                            )}
                        </div>

                        <div className={styles.buttonsBox}>
                            <button onClick={() => setProfileModal(true)}>프로필 변경</button>
                            <button onClick={() => setMemberInfoModal(true)}>회원정보 수정</button>
                            <button onClick={() => setAlarmModal(true)}>알림 설정</button>
                        </div>
                    </div>
                </section>
            )}

            <div className={styles.recipeSummary}>
                <div className={styles.summaryCard}>
                    <p>마이 레시피</p>
                    <span>{myRecipes.length}</span>
                </div>
                <div className={styles.summaryCard}>
                    <p>찜한 레시피</p>
                    <span>{myRecipes.length}</span>
                </div>

                <div className={styles.navButtons}>
                    <button
                        className={styles.mealBtn}
                        onClick={() => navigate("/mypage/mealplan")}
                    >
                        MY <br /> 식단관리
                    </button>
                    <button
                        className={styles.fridgeBtn}
                        onClick={() => navigate("/mypage/inglist")}
                    >
                        MY <br /> 냉장고
                    </button>
                </div>
            </div>

            <div className={styles.allergySection}>
                <h3>내 알레르기 정보</h3>
                <div className={styles.allergyTags}>
                    {allergyInfo.length > 0 ? (
                        allergyInfo.map((item, idx) => (
                            <span key={idx} className={styles.allergyTag}>
                                {item}
                            </span>
                        ))
                    ) : (
                        <p>등록된 알레르기 정보가 없습니다.</p>
                    )}
                </div>
                <button className={styles.editAllergyBtn} onClick={() => setAllergyModal(true)}>
                    알레르기 정보 수정
                </button>
            </div>

            <div className={styles.recipeList}>
                <h3>내가 찜한 레시피</h3>
                <ul>
                    {myRecipes.length > 0 ? (
                        myRecipes.map((r) => (
                            <li key={r.id} className={styles.recipeItem}>
                                <img src={r.img} alt="recipe" />
                                <span className={styles.recipeTitle}>{r.title}</span>
                                <span className={styles.recipeLikes}>👍 {r.likes}</span>
                            </li>
                        ))
                    ) : (
                        <li className={styles.emptyRow}>찜한 레시피가 없습니다.</li>
                    )}
                </ul>
            </div>

            {isProfileModal && (
                <ProfileModal user={user!} onClose={() => setProfileModal(false)} onUpdateProfile={handleUpdateProfile} />
            )}
            {isAllergyModal && (
                <AllergyModal user={user!} onClose={() => setAllergyModal(false)} />
            )}
            {isMemberInfoModal && (
                <MemberInfoModal user={user!} onClose={() => setMemberInfoModal(false)} />
            )}
            {isAlarmModal && (
                <AlarmModal user={user!} onClose={() => setAlarmModal(false)} />
            )}
            {isInactiveModal && (
                <InactiveModal
                    user={user!}
                    onClose={() => setInactiveModal(false)}
                    onConfirm={handleInactive}
                />
            )}
        </div>

    );
};

export default MyPage;