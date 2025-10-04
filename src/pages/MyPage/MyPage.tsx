import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "./MyPage.module.css";
import kakaoLogo from "./kakaologo.png";

import ProfileModal from "../../components/MyPage/ProfileModal";
import AllergyModal from "../../components/MyPage/AllergyModal";
import MemberInfoModal from "../../components/MyPage/MemberInfoModal";
import AlarmModal from "../../components/MyPage/AlarmModal";
// 신고
import ReportModal from '../../components/Report/ReportModal';

import type { RootState } from "../../store/store";
import { useNavigate, useParams } from "react-router-dom";
import defaultProfile from "./defaultprofile.png"
import InactiveModal from "../../components/MyPage/InactiveModal";
import { updateProfileImage } from "../../features/authSlice";
import type { User } from "../../type/authtype"
import type { AllergyDto } from "../../type/allergytype";
import { api } from "../../api/authApi";
import SikBti from "../community/Recipe/SikBti";
import type { MyPageRecipe } from "../../type/Recipe";
import Pagination from "../../components/Pagination";
import type { PageInfo } from "../../api/adminApi";

interface ReportTargetInfo {
    author: string;
    title: string;
    category: string;
    refNo: number;
    reportedUserProfileImageUrl?: string;
}

interface ReportOption {
    reportType: string;
    category: string;
    detail: string;
}

const MyPage = () => {
    const { userNo } = useParams();
    const [isProfileModal, setProfileModal] = useState(false);
    const [isAllergyModal, setAllergyModal] = useState(false);
    const [isMemberInfoModal, setMemberInfoModal] = useState(false);
    const [isAlarmModal, setAlarmModal] = useState(false);
    const [isInactiveModal, setInactiveModal] = useState(false);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportTargetInfo, setReportTargetInfo] = useState<ReportTargetInfo | null>(null);
    const [reportOptions, setReportOptions] = useState<ReportOption[]>([]);


    const dispatch = useDispatch();
    const [allergyInfo, setAllergyInfo] = useState<{ id: number; name: string; parent: string }[]>([]);
    const [myRecipes, setMyRecipes] = useState<MyPageRecipe[]>([]);
    const [likedRecipes, setLikedRecipes] = useState<MyPageRecipe[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const [activeTab, setActiveTab] = useState<"my" | "liked">("my");


    const handleUpdateProfile = (newUrl: string) => {
        dispatch(updateProfileImage(newUrl));
    };

    const paginatedMyRecipes = myRecipes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const paginatedLikedRecipes = likedRecipes.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const listCount = activeTab === "my" ? myRecipes.length : likedRecipes.length;
    const pageLimit = 10;
    const itemLimit = itemsPerPage;

    const maxPage = Math.ceil(listCount / itemLimit);
    const startPage = Math.floor((currentPage - 1) / pageLimit) * pageLimit + 1;
    const endPage = Math.min(startPage + pageLimit - 1, maxPage);

    const pageInfo: PageInfo = {
        listCount,
        pageLimit,
        itemLimit,
        currentPage,
        maxPage,
        startPage,
        endPage,
    };
    const [profileImg, setProfileImg] = useState<File | null>(null);
    const myProfile = useSelector((state: RootState) => state.auth.user);
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const [user, setUser] = useState<User>();

    const isMyPage = (Number(userNo) === myProfile?.userNo) || myProfile?.roles.includes("ROLE_ADMIN");

    const fetchData = async (user: User) => {
        console.log(user)
        const api = axios.create({
            baseURL: "http://3.38.213.177:8081/users",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        try {
            const profileRes = await api.post("/profiles", user);
            setUser((prev) => ({ ...prev, ...user, profile: profileRes.data }));

            const allergyRes = await api.get("/allergy", {
                params: { userNo: user.userNo },
            });

            const allergyListRes = await api.get(`/allergy-list`);
            const allergyTree = allergyListRes.data;

            const flattenAllergies = (
                tree: AllergyDto[]
            ): { id: number; name: string; parent: string }[] => {
                const result: { id: number; name: string; parent: string }[] = [];

                const traverse = (nodes: AllergyDto[], parentName?: string) => {
                    for (const node of nodes) {
                        if (node.children && node.children.length > 0) {
                            traverse(node.children, node.name);
                        } else {
                            result.push({
                                id: node.allergyNo,
                                name: node.name,
                                parent: parentName ?? "기타",
                            });
                        }
                    }
                };

                traverse(tree);
                return result;
            };


            const flatAllergies = flattenAllergies(allergyTree);
            const userAllergies = flatAllergies.filter((a) =>
                allergyRes.data.includes(a.id)
            );

            setAllergyInfo(userAllergies);

            const myRecipesRes = await api.get(`/${user.userNo}/recipes`);
            const likedRes = await api.get(`/${user.userNo}/likes`);

            const formattedMyRecipes: MyPageRecipe[] = myRecipesRes.data.map((r: any) => ({
                id: r.RCP_NO,
                title: r.RCP_NAME,
                likes: r.RCP_LIKE,
                img: r.SERVER_NAME
                    ? `http://3.38.213.177:8081/images/community/recipe/${r.RCP_NO}/${r.SERVER_NAME}`
                    : defaultProfile,
            }));
            setMyRecipes(formattedMyRecipes);

            const formattedLikedRecipes: MyPageRecipe[] = likedRes.data.map((r: any) => ({
                id: r.RCP_NO,
                title: r.RCP_NAME,
                likes: r.RCP_LIKE,
                img: r.SERVER_NAME
                    ? `http://3.38.213.177:8081/images/community/recipe/${r.RCP_NO}/${r.SERVER_NAME}`
                    : defaultProfile,
            }));
            setLikedRecipes(formattedLikedRecipes);
        } catch (err) {
            console.error("마이페이지 데이터 불러오기 오류:", err);
        }
    };

    useEffect(() => {
        if (myProfile) {
            fetchData(myProfile);
        }
    }, [accessToken,myProfile]);

    useEffect(() => {
        if (myProfile) {
            if ((Number(userNo) !== myProfile.userNo)) {
                api.get(`users/profile/${userNo}`)
                    .then(res => {
                        console.log(res.data)
                        return res.data
                    })
                    .then((user: User) => {
                        fetchData(user)
                    })
                    .catch(err => {
                        if (err.response?.status === 410) {
                            alert("탈퇴한 회원입니다.");
                            navigate("/home");
                        } else {
                            alert("유저 정보를 불러올 수 없습니다.");
                        }
                    });
            } else {
                setUser(myProfile);
            }
        }
    }, [myProfile, userNo]);

    const navigate = useNavigate();
    const handleInactive = () => {
    };

    const handleReportClick = async () => {
        const category = 'USERS';
        if (!user || !myProfile?.userNo) {
            alert('로그인 후 신고 가능합니다.');
            return;
        }

        const reportedUserProfileImageUrl = !user.profile || user.imageNo === 0
            ? defaultProfile
            : user.profile;

        const targetInfo: ReportTargetInfo = {
            author: user.username,
            title: `${user.username} 님 프로필`,
            category,
            refNo: Number(userNo),
            reportedUserProfileImageUrl,
        };

        setReportTargetInfo(targetInfo);

        try {
            const reportApi = axios.create({
                baseURL: "http://3.38.213.177:8081",
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const res = await reportApi.get<ReportOption[]>('/community/report/types');

            const filteredOptions = res.data.filter((option) => option.category === category);
            setReportOptions(filteredOptions);

            if (filteredOptions.length === 0) {
                alert('해당 카테고리의 신고 옵션이 없습니다.');
                return;
            }

            setIsReportModalOpen(true);
        } catch (err) {
            console.error('신고 옵션 fetch 실패:', err);
            setReportOptions([]);
            alert('신고 옵션 로드 실패');
        }
    };

    const handleReportSubmit = async (reportType: string, content: string, refNo: number, reportedUserProfileImageUrl?: string) => {
        if (!myProfile?.userNo || !reportTargetInfo) {
            alert('로그인 정보가 유효하지 않아 신고할 수 없습니다.');
            return;
        }

        try {
            const reportApi = axios.create({
                baseURL: "http://3.38.213.177:8081",
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            await reportApi.post('/community/report', {
                reportType,
                content,
                refNo,
                refType: reportTargetInfo.category,
            });

            alert('신고가 접수되었습니다. 감사합니다.');
            setIsReportModalOpen(false);
            setReportTargetInfo(null);
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || '신고 실패');
            setIsReportModalOpen(false);
            setReportTargetInfo(null);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                {isMyPage ? (
                    <button
                        className={styles.inactiveBtn}
                        onClick={() => setInactiveModal(true)}
                    >
                        회원탈퇴
                    </button>
                ) : (
                    <button
                        className={styles.reportBtn}
                        onClick={handleReportClick}
                    > 신고하기
                    </button>
                )}
            </div>

            {user && (
                <section className={styles.profileSection}>
                    <div className={styles.leftProfile}>
                        <img
                            src={!user.profile ? defaultProfile : (user.imageNo !== 0 ? user.profile : defaultProfile)}
                            className={styles.profileImg}
                        />
                    </div>

                    <div className={styles.profileInfo}>
                        <SikBti sikBti={user.sikbti} style={{ fontSize: '15px' }} />
                        <div className={styles.nameRow}>
                            <h2 className={styles.username}>{user.username}</h2>
                            {isMyPage && <span className={styles.email}>({user.email})</span>}
                            {user.provider === "kakao" && (
                                <img
                                    src={kakaoLogo}
                                    alt="kakao logo"
                                    className={styles.socialLogo}
                                />
                            )}
                        </div>

                        {isMyPage ? (
                            <>
                                <div className={styles.buttonsBox}>
                                    <button onClick={() => setProfileModal(true)}>프로필 변경</button>
                                    <button onClick={() => setMemberInfoModal(true)}>회원정보 수정</button>
                                    <button onClick={() => setAlarmModal(true)}>알림 설정</button>
                                </div>
                            </>
                        ) : <></>}
                    </div>
                </section>
            )}
            <div className={styles.my0ptions}>
                {isMyPage && (
                    <div className={styles.navButtons}>
                        <button
                            className={styles.mealBtn}
                            onClick={() => navigate("/mypage/mealplan")}
                        >
                            MY <br /> 식단관리 <br />
                        </button>
                        <button
                            className={styles.fridgeBtn}
                            onClick={() => navigate("/mypage/inglist")}
                        >
                            MY <br /> 냉장고 <br />
                        </button>
                        <button
                            className={styles.myposts}
                            onClick={() => navigate("/community/mypost")}
                        >
                            내가 쓴 글 보러가기
                        </button>
                    </div>

                )}
            </div>

            {isMyPage && (
                <div className={styles.allergySection}>
                    <h3>내 알레르기 정보</h3>
                    <div className={styles.allergyCard}>
                        <div className={styles.allergyTags}>
                            {allergyInfo.length > 0 ? (
                                allergyInfo.map((item) => (
                                    <span
                                        key={item.id}
                                        className={`${styles.allergyTag} ${styles[item.parent] || ""}`}
                                    >
                                        {item.name}
                                    </span>
                                ))
                            ) : (
                                <p>등록된 알레르기 정보가 없습니다.</p>
                            )}
                        </div>
                    </div>
                    <button
                        className={styles.editAllergyBtn}
                        onClick={() => setAllergyModal(true)}
                    >
                        알레르기 정보 수정
                    </button>
                </div>
            )}

            <br />

            <div className={styles.tabContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === "my" ? styles.active : ""}`}
                    onClick={() => setActiveTab("my")}
                >
                    {isMyPage ? `내가 작성한 레시피` : `${user?.username} 님이 작성한 레시피 `}
                    <div className={styles.badge1}>{myRecipes.length}</div>
            </button>

                <button
                    className={`${styles.tabButton} ${activeTab === "liked" ? styles.active : ""}`}
                    onClick={() => setActiveTab("liked")}
                >
                    {isMyPage ? "내가 추천한 레시피" : `${user?.username} 님이 추천한 레시피`}
                    <div className={styles.badge2}>{likedRecipes.length}</div>
                </button>
            </div>

            <div className={styles.recipeList}>
                {activeTab === "my" ? (
                    <>
                        <ul>
                            {paginatedMyRecipes.length > 0 ? (
                                paginatedMyRecipes.map((r) => (
                                    <li
                                        key={r.id}
                                        className={styles.recipeItem}
                                        onClick={() => navigate(`/community/recipe/${r.id}`)}
                                    >
                                        <img src={r.img} alt="recipe" />
                                        <span className={styles.recipeTitle}>{r.title}</span>
                                        <span className={styles.recipeLikes}>👍 {r.likes}</span>
                                    </li>
                                ))
                            ) : (
                                <li className={styles.emptyRow}>
                                    {isMyPage ? "작성한 레시피가 없습니다." : "작성한 레시피가 없습니다."}
                                </li>
                            )}
                        </ul>

                        {myRecipes.length > itemsPerPage && (
                            <Pagination
                                pageInfo={pageInfo}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <ul>
                            {paginatedLikedRecipes.length > 0 ? (
                                paginatedLikedRecipes.map((r) => (
                                    <li
                                        key={r.id}
                                        className={styles.recipeItem}
                                        onClick={() => navigate(`/community/recipe/${r.id}`)}
                                    >
                                        <img src={r.img} alt="recipe" />
                                        <span className={styles.recipeTitle}>{r.title}</span>
                                        <span className={styles.recipeLikes}>👍 {r.likes}</span>
                                    </li>
                                ))
                            ) : (
                                <li className={styles.emptyRow}>
                                    {isMyPage ? "찜한 레시피가 없습니다." : "찜한 레시피가 없습니다."}
                                </li>
                            )}
                        </ul>

                        {likedRecipes.length > itemsPerPage && (
                            <Pagination
                                pageInfo={pageInfo}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        )}
                    </>
                )}
            </div>

            {isProfileModal && (
                <ProfileModal
                    user={user!}
                    onClose={() => setProfileModal(false)}
                    onUpdateProfile={handleUpdateProfile}
                    profileImg={profileImg}
                    setProfileImg={setProfileImg}
                />
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

            {isReportModalOpen && reportTargetInfo && (
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    onSubmit={handleReportSubmit}
                    targetInfo={reportTargetInfo}
                    reportOptions={reportOptions}
                />
            )}
        </div>
    );
};

export default MyPage;