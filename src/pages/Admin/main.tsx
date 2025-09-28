import { useEffect, useState } from 'react';
import style from './main.module.css';
import {
    approveRecipe,
    banUser,
    disproveRecipe,
    fetchChallenges,
    fetchCommReports,
    fetchRecipes,
    fetchUserReports,
    getChatRoom,
    getParentRep,
    resolveChallenge,
    resolveReport,
    type ChallengeForm,
    type PageInfo,
    type Recipe,
    type Reports,
} from '../../api/adminApi';
import Pagination from '../../components/Pagination';
import { useDispatch, useSelector } from 'react-redux';
import { openChat } from "../../features/chatSlice";
import type { Message } from '../../type/chatmodal';
import { RcpAlertModal } from '../../components/Admin/rcpAlertModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveMessage } from '../../api/chatApi';
import useChat from '../../hooks/useChat';
import type { RootState } from '../../store/store';
import { Link, useNavigate } from 'react-router-dom';
import { openNewChallengeModal } from '../../features/adminModalSlice';
import { setTotalReports } from '../../features/adminStateSlice';

export const AdminDashboard = () => {
    const [userReports, setUserReports] = useState<Reports[]>([]);
    const [userPageInfo, setUserPageInfo] = useState<PageInfo | null>(null);
    const [commReports, setCommReports] = useState<Reports[]>([]);
    const [commPageInfo, setCommPageInfo] = useState<PageInfo | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [rcpPageInfo, setRcpPageInfo] = useState<PageInfo | null>(null);
    const [challenges, setChallenges] = useState<ChallengeForm[]>([]);
    const [chPageInfo, setChPageInfo] = useState<PageInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [openCard, setOpenCard] = useState<string | number | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmInput, setConfirmInput] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState<any>(null);
    const [confirmMessage, setConfirmMessage] = useState<string>("이 신고내역을 처리 완료 하시겠습니까?");
    const [confirmAction, setConfirmAction] = useState<(value?: string) => void>(() => () => { });

    const { sendChatMessage } = useChat();
    const user = useSelector((state: RootState) => state.auth.user);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const handleToggleCard = (id: number | string) => {
        setOpenCard((prev) => (prev === id ? null : id));
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [userData, commData, rcpData, chData] = await Promise.all([
                fetchUserReports(1, 5),
                fetchCommReports(1, 5),
                fetchRecipes(1, 5),
                fetchChallenges(1, 5)
            ]);

            setUserReports(userData.list);
            setUserPageInfo(userData.pageInfo);
            setCommReports(commData.list);
            setCommPageInfo(commData.pageInfo);
            setRecipes(rcpData.list);
            setRcpPageInfo(rcpData.pageInfo);
            setChallenges(chData.list);
            setChPageInfo(chData.pageInfo);

            // Calculate and dispatch the new total count
            const totalCount = userData.pageInfo.listCount + commData.pageInfo.listCount + rcpData.pageInfo.listCount + chData.pageInfo.listCount;
            dispatch(setTotalReports(totalCount));

        } catch (err) {
            setError('관리 내역을 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
            setOpenCard(null);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUserPageChange = async (page: number) => {
        try {
            const userData = await fetchUserReports(page, 5);
            setUserReports(userData.list);
            setUserPageInfo(userData.pageInfo);
            setOpenCard(null);
        } catch (err) {
            setError('회원 신고 내역을 불러오는 데 실패했습니다.');
            console.error(err);
        }
    };

    const handleCommPageChange = async (page: number) => {
        try {
            const commData = await fetchCommReports(page, 5);
            setCommReports(commData.list);
            setCommPageInfo(commData.pageInfo);
            setOpenCard(null);
        } catch (err) {
            setError('커뮤니티 신고 내역을 불러오는 데 실패했습니다.');
            console.error(err);
        }
    };

    const handleRcpPageChange = async (page: number) => {
        try {
            const rcpData = await fetchRecipes(page, 5);
            setRecipes(rcpData.list);
            setRcpPageInfo(rcpData.pageInfo);
            setOpenCard(null);
        } catch (err) {
            setError('레시피 관리 내역을 불러오는 데 실패했습니다.');
            console.error(err);
        }
    };

    const handleChPageChange = async (page: number) => {
        try {
            const chData = await fetchChallenges(page, 5);
            setChallenges(chData.list);
            setChPageInfo(chData.pageInfo);
            setOpenCard(null);
        } catch (err) {
            setError('챌린지 요청 내역을 불러오는 데 실패했습니다.');
            console.error(err);
        }
    };

    const openConfirm = (
        action: (value?: string) => void,
        input: boolean = false,
        target: any = null,
        message: string = "이 신고내역을 처리 완료 하시겠습니까?"
    ) => {
        setConfirmAction(() => action);
        setConfirmInput(input);
        setConfirmTarget(target);
        setConfirmMessage(message);
        setConfirmOpen(true);
    };

    const handleOpenReport = async (c: Reports) => {
        let ref = window.location.origin + "/";
        switch (c.category) {
            case "USERS":
                ref += `users/${c.refNo}`;
                break;
            case "BOARD":
                ref += `community/free/${c.refNo}`;
                break;
            case "MARKETPLACE":
                ref += `community/market/buyForm/${c.refNo}`;
                break;
        }
        const response = await getParentRep(c.reportNo);
        switch (response.category) {
            case "Y":
                ref += `api/recipe/${response.targetNo}`;
                break;
            case "N":
            case "C":
                ref += `community/recipe/${response.targetNo}`;
                break;
        }
        switch (response.category) {
            case "BOARD":
                ref += `community/free/${response.targetNo}`;
                window.open(ref, "_blank", "noopener,noreferrer");
                break;
            case "CHALLENGE":
                ref += `community/challenge/${response.targetNo}`;
                window.open(ref, "_blank", "noopener,noreferrer");
                break;
            case "MARKET":
                ref += `community/market/buyForm/${response.targetNo}`;
                window.open(ref, "_blank", "noopener,noreferrer");
                break;
            default:
                const newWin = window.open(ref, "_blank", "noopener,noreferrer");
                setTimeout(() => {
                    newWin?.postMessage({ action: "scrollBottom" }, window.location.origin);
                }, 1000);
        }
    };

    const handleOpenRcp = (c: Recipe) => {
        const category = c.approval === 'Y' ? "api" : "community";
        const ref = window.location.origin + `/${category}/recipe/` + c.rcpNo;
        window.open(ref, '_blank', 'noopener,noreferrer');
    };

    const handleOpenCh = (c: ChallengeForm) => {
        const ref = c.reference.trim();
        if (ref && (ref.startsWith('http://') || ref.startsWith('https://'))) {
            window.open(ref, '_blank', 'noopener,noreferrer');
        } else {
            alert('유효한 페이지가 아닙니다.');
        }
    };

    const handleResolve = async (report: Reports | Recipe) => {
        try {
            await resolveReport(report.reportNo);
            if ("category" in report) {
                if (report.category === 'USERS') {
                    setUserReports((prev) => prev.filter((c) => c.reportNo !== report.reportNo));
                    fetchData();
                } else {
                    setCommReports((prev) => prev.filter((c) => c.reportNo !== report.reportNo));
                    fetchData();
                }
            } else {
                setRecipes((prev) => prev.filter((c) => c.reportNo !== report.reportNo));
                fetchData();
            }
        } catch {
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    // 레시피 승인.기각 메시지 전송
    const mutation = useMutation({
        mutationFn: ({ roomNo, formData }: { roomNo: string | number; formData: FormData }) =>
            saveMessage("admin", roomNo, formData),
        onSuccess: (res, variables) => {
            queryClient.invalidateQueries({ queryKey: ["rooms", variables.roomNo] });
            sendChatMessage(variables.roomNo, res);
        },
    });

    // 레시피 승인 함수
    const handleResolveRcp = async (recipe: Recipe) => {
        try {
            await approveRecipe(recipe.rcpNo);
            setRecipes(prev => prev.filter(c => c.rcpNo !== recipe.rcpNo));
            fetchData();

            // 채팅방 가져오기
            const chatRoom = await getChatRoom(recipe.userNo);

            // 메시지 객체 생성
            const message: Message = {
                content: `축하합니다! ${recipe.title} 레시피가 공식 레시피로 전환되었습니다.`,
                userNo: user?.userNo as number,
                username: user?.username as string,
                createdAt: new Date().toISOString(),
                roomNo: chatRoom.roomNo
            };

            // 서버에 보낼 formData
            const messageBlob = new Blob([JSON.stringify(message)], { type: "application/json" });
            const formData = new FormData();
            formData.append("message", messageBlob);

            // 뮤테이션 실행
            mutation.mutate({ roomNo: chatRoom.roomNo, formData });
            dispatch(openChat(chatRoom));
        } catch (err) {
            alert("처리 중 오류가 발생했습니다.");
            console.error(err);
        }
    };

    // 레시피 기각
    const handleDisproveRcp = async (recipe: Recipe, reason?: string) => {
        try {
            await disproveRecipe(recipe.rcpNo);
            setRecipes(prev => prev.filter(c => c.rcpNo !== recipe.rcpNo));
            fetchData();

            // 채팅방 가져오기
            const chatRoom = await getChatRoom(recipe.userNo);

            // 메시지 객체 생성
            const message: Message = {
                content: `죄송합니다. ${recipe.title} 레시피가 공식 레시피 전환에 실패했습니다.
                    기각 사유는 다음과 같습니다: ${reason}`,
                userNo: user?.userNo as number,
                username: user?.username as string,
                createdAt: new Date().toISOString(),
                roomNo: chatRoom.roomNo
            };

            // 서버에 보낼 formData
            const messageBlob = new Blob([JSON.stringify(message)], { type: "application/json" });
            const formData = new FormData();
            formData.append("message", messageBlob);

            // 뮤테이션 실행
            mutation.mutate({ roomNo: chatRoom.roomNo, formData });
            dispatch(openChat(chatRoom));
        } catch (err) {
            alert("처리 중 오류가 발생했습니다.");
            console.error(err);
        }
    };

    const handleUserBan = async (reportNo: number, userNo: number, banDur: string) => {
        try {
            await banUser(userNo, banDur);
            await resolveReport(reportNo);
            setUserReports((prev) => prev.filter((c) => c.reportNo !== reportNo));
            fetchData();
        } catch {
            alert('처리 중 오류가 발생했습니다.');
        }
    }

    const handleResolveCh = async (formNo: number) => {
        try {
            await resolveChallenge(formNo);
            setChallenges((prev) => prev.filter((c) => c.formNo !== formNo));
            fetchData();
        } catch {
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    const handleRegister = (c: ChallengeForm) => {
        dispatch(openNewChallengeModal({
            title: c.chTitle,
        }));
    };

    return (
        <div className={style.adminMain}>
            <div className={style.adminNav}>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/users`)}>USER</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/recipes`)}>RECIPE</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/communities`)}>COMMUNITY</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/classes`)}>CLASS</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/cservices`)}>CS</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/announcements`)}>ANNOUNCEMENT</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/challenges`)}>CHALLENGE</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/ingredients`)}>INGREDIENT</button>
            </div>
            <div className={style.container}>
                {/* 회원관리 */}
                <div className={style.section}>
                    <h3>
                        <Link to="/admin/users">회원관리 🔐</Link>
                    </h3>
                    <hr />
                    <div className={style.sectionBody}>
                        {!loading && !error && userReports.length === 0 && (
                            <div className={style.emptyState}>처리할 신고 내역이 없습니다.</div>
                        )}
                        {userReports.map((c) => (
                            <div key={c.reportNo} className={style.card}>
                                <div className={style.cardHeader} onClick={() => handleToggleCard(c.reportNo)}>
                                    <span className={style.cardId}>ID {c.refNo}</span>
                                    <span className={style.cardTitle}>{c.detail}</span>
                                    <div className={style.cardDateWrap}>
                                        <span className={style.cardDate}>{new Date(c.reportedAt).toLocaleString()}</span>
                                        <span className={style.toggleIcon}>{openCard === c.reportNo ? '▲' : '▼'}</span>
                                    </div>
                                </div>
                                {openCard === c.reportNo && (
                                    <>
                                        <div className={style.cardContent}>
                                            <strong>USER {c.userNo}</strong>
                                            <div>{c.content}</div>
                                        </div>
                                        <div className={style.cardActions}>
                                            <button onClick={() => handleOpenReport(c)}>상세보기</button>
                                            <select name="banDur" id={`banDur-${c.reportNo}`}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (!value) return;
                                                    openConfirm(
                                                        () => handleUserBan(c.reportNo, c.refNo, value),
                                                        false,
                                                        c,
                                                        `해당 유저를 ${value}일 정지하시겠습니까?`
                                                    );
                                                    e.currentTarget.value = "";
                                                }}>
                                                <option value="">정지</option>
                                                <option value="3">3일</option>
                                                <option value="7">7일</option>
                                                <option value="30">30일</option>
                                                <option value="365">365일</option>
                                            </select>
                                            <button onClick={() => openConfirm(() => handleResolve(c))}>처리완료</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {userPageInfo && userPageInfo.listCount > 5 && (
                            <Pagination pageInfo={userPageInfo} onPageChange={handleUserPageChange} />
                        )}
                    </div>
                </div>

                {/* 레시피 관리 */}
                <div className={style.section}>
                    <h3>
                        <Link to="/admin/recipes">레시피 관리 🍳</Link>
                    </h3>
                    <hr />
                    <div className={style.sectionBody}>
                        {!loading && !error && recipes.length === 0 && (
                            <div className={style.emptyState}>관리할 레시피가 없습니다.</div>
                        )}
                        {recipes.map((c) => (
                            <div key={`${c.rcpNo}-${c.reportNo}`} className={style.card}>
                                <div className={style.cardHeader} onClick={() => handleToggleCard(`${c.rcpNo}-${c.reportNo}`)}>
                                    <span className={style.cardId}>ID {c.rcpNo}</span>
                                    <span className={style.cardTitle}>{c.type === 'RECIPE' ? c.title : c.detail}</span>
                                    <div className={style.cardDateWrap}>
                                        {c.type === 'REPORT' && <span className={style.cardDate}>{new Date(c.reportedAt).toLocaleString()}</span>}
                                        <span className={style.toggleIcon}>{openCard === `${c.rcpNo}-${c.reportNo}` ? '▲' : '▼'}</span>
                                    </div>
                                </div>
                                {openCard === `${c.rcpNo}-${c.reportNo}` && (
                                    <>
                                        <div className={style.cardContent}>
                                            <strong>USER {c.userNo}</strong>
                                            <div>{c.type === 'RECIPE' ? c.info : c.content}</div>
                                        </div>
                                        <div className={style.cardActions}>
                                            <button onClick={() => handleOpenRcp(c)}>상세보기</button>
                                            {c.type === 'REPORT' ? (
                                                <button onClick={() => openConfirm(() => handleResolve(c))}>처리완료</button>
                                            ) : (
                                                <>
                                                    <button onClick={() => openConfirm(() => handleResolveRcp(c))}>승인</button>
                                                    <button
                                                        onClick={() =>
                                                            openConfirm((reason) => handleDisproveRcp(c, reason), true, c)
                                                        }
                                                    >
                                                        기각
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {rcpPageInfo && rcpPageInfo.listCount > 5 && (
                            <div className={style.sectionFooter}>

                                <Pagination pageInfo={rcpPageInfo} onPageChange={handleRcpPageChange} />
                            </div>
                        )}
                    </div>
                </div>

                {/* 커뮤니티 관리 */}
                <div className={style.section}>
                    <h3>
                        <Link to="/admin/communities">커뮤니티 관리 🎮</Link>
                    </h3>
                    <hr />
                    <div className={style.sectionBody}>
                        {!loading && !error && commReports.length === 0 && (
                            <div className={style.emptyState}>처리할 신고 내역이 없습니다.</div>
                        )}
                        {commReports.map((c) => (
                            <div key={c.reportNo} className={style.card}>
                                <div className={style.cardHeader} onClick={() => handleToggleCard(c.reportNo)}>
                                    <span className={style.cardId}>ID {c.reportNo}</span>
                                    <span className={style.cardTitle}>{c.detail}</span>
                                    <div className={style.cardDateWrap}>
                                        <span className={style.cardDate}>{new Date(c.reportedAt).toLocaleString()}</span>
                                        <span className={style.toggleIcon}>{openCard === c.reportNo ? '▲' : '▼'}</span>
                                    </div>
                                </div>
                                {openCard === c.reportNo && (
                                    <>
                                        <div className={style.cardContent}>
                                            <strong>USER {c.userNo}</strong>
                                            <div>{c.content}</div>
                                        </div>
                                        <div className={style.cardActions}>
                                            <button onClick={() => handleOpenReport(c)}>상세보기</button>
                                            <button onClick={() => openConfirm(() => handleResolve(c))}>처리완료</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {commPageInfo && commPageInfo.listCount > 5 && (
                            <Pagination pageInfo={commPageInfo} onPageChange={handleCommPageChange} />
                        )}
                    </div>
                </div>

                {/* 챌린지 관리 */}
                <div className={style.section}>
                    <h3>새 챌린지 요청 💌</h3>
                    <hr />
                    <div className={style.sectionBody}>
                        {!loading && !error && challenges.length === 0 && (
                            <div className={style.emptyState}>처리할 신규 요청이 없습니다.</div>
                        )}
                        {challenges.map((c) => (
                            <div key={c.formNo} className={style.card}>
                                <div className={style.cardHeader} onClick={() => handleToggleCard(c.formNo)}>
                                    <span className={style.cardId}>ID {c.formNo}</span>
                                    <span className={style.cardTitle}>{c.chTitle}</span>
                                    <div className={style.cardDateWrap}>
                                        <span className={style.cardDate}>{new Date(c.createdAt).toLocaleString()}</span>
                                        <span className={style.toggleIcon}>{openCard === c.formNo ? '▲' : '▼'}</span>
                                    </div>
                                </div>
                                {openCard === c.formNo && (
                                    <>
                                        <div className={style.cardContent}>
                                            <strong>USER {c.userNo}</strong>
                                            <div>{c.description}</div>
                                        </div>
                                        <div className={style.cardActions}>
                                            <button onClick={() => handleOpenCh(c)}>상세보기</button>
                                            <button onClick={() => handleRegister(c)}>등록하기</button>
                                            <button onClick={() => openConfirm(() => handleResolveCh(c.formNo))}>처리완료</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {chPageInfo && chPageInfo.listCount > 5 && (
                            <Pagination pageInfo={chPageInfo} onPageChange={handleChPageChange} />
                        )}
                    </div>
                </div>

                <RcpAlertModal
                    open={confirmOpen}
                    title="확인"
                    message={confirmInput ? "사유를 입력해주세요." : confirmMessage}
                    input={confirmInput}
                    onConfirm={(value) => {
                        confirmAction(value);
                        setConfirmOpen(false);
                    }}
                    onCancel={() => setConfirmOpen(false)}
                />
            </div>
        </div>
    );
};
