import { useEffect, useState } from 'react';
import style from './main.module.css';
import {
    approveRecipe,
    disproveRecipe,
    fetchChallenges,
    fetchCommReports,
    fetchRecipes,
    fetchUserReports,
    getChatRoom,
    resolveChallenge,
    resolveReport,
    type ChallengeForm,
    type PageInfo,
    type Recipe,
    type Reports,
} from '../../api/adminApi';
import Pagination from '../../components/Pagination';
import { useDispatch } from 'react-redux';
import { openChat, sendMessage } from "../../features/chatSlice";
import type { Message } from '../../type/chatmodal';
import { RcpAlertModal } from '../../components/Admin/rcpAlertModal';

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
    const [openCards, setOpenCards] = useState<{ [key: number | string]: boolean }>({});

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmInput, setConfirmInput] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState<any>(null);
    const [confirmAction, setConfirmAction] = useState<(value?: string) => void>(() => () => { });

    const dispatch = useDispatch();

    const handleToggleCard = (id: number | string) => {
        setOpenCards((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const fetchUserData = async (page: number) => {
        const data = await fetchUserReports(page, 5);
        setUserReports(data.list);
        setUserPageInfo(data.pageInfo);
    };
    const fetchCommData = async (page: number) => {
        const data = await fetchCommReports(page, 5);
        setCommReports(data.list);
        setCommPageInfo(data.pageInfo);
    };
    const fetchRcpData = async (page: number) => {
        const data = await fetchRecipes(page, 5);
        setRecipes(data.list);
        setRcpPageInfo(data.pageInfo);
    };
    const fetchChData = async (page: number) => {
        const data = await fetchChallenges(page, 5);
        setChallenges(data.list);
        setChPageInfo(data.pageInfo);
    };

    useEffect(() => {
        setLoading(true);
        try {
            fetchUserData(1);
            fetchCommData(1);
            fetchRcpData(1);
            fetchChData(1);
        } catch {
            setError('관리 내역을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
            setOpenCards({});
        }
    }, []);

    const openConfirm = (
        action: (value?: string) => void,
        input: boolean = false,
        target: any = null
    ) => {
        setConfirmAction(() => action);
        setConfirmInput(input);
        setConfirmTarget(target);
        setConfirmOpen(true);
    };

    const handleOpenReport = (c: Reports) => {
        let ref = window.location.origin + "/";
        if (c.category === 'BOARD') ref += "";
        if (c.category === 'MARKETPLACE') ref += "";
        if (c.category === 'REPLY') ref += "";
        if (c.category === 'REVIEW') ref += "";
        window.open(ref, '_blank', 'noopener,noreferrer');
    };

    const handleOpenRcp = (c: Recipe) => {
        const ref = window.location.origin + "/" + c.rcpNo;
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
                    fetchUserData(1);
                } else {
                    setCommReports((prev) => prev.filter((c) => c.reportNo !== report.reportNo));
                    fetchCommData(1);
                }
            } else {
                setRecipes((prev) => prev.filter((c) => c.reportNo !== report.reportNo));
                fetchRcpData(1);
            }
        } catch {
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    // 레시피 승인
    const handleResolveRcp = async (recipe: Recipe) => {
        try {
            await approveRecipe(recipe.rcpNo);
            setRecipes(prev => prev.filter(c => c.rcpNo !== recipe.rcpNo));
            fetchRcpData(1);
            const chatRoom = await getChatRoom(recipe.userNo);
            dispatch(openChat(chatRoom));
            const message: Message = {
                content: `축하합니다! ${recipe.title} 레시피가 공식 레시피로 전환되었습니다.`,
                userNo: recipe.userNo,
                username: "admin",
                createdAt: new Date().toISOString(),
                roomNo: chatRoom.roomNo
            };
            sendMessage(message);
        } catch {
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    // 레시피 기각
    const handleDisproveRcp = async (recipe: Recipe, reason?: string) => {
        try {
            await disproveRecipe(recipe.rcpNo);
            setRecipes(prev => prev.filter(c => c.rcpNo !== recipe.rcpNo));
            fetchRcpData(1);
            const chatRoom = await getChatRoom(recipe.userNo);
            dispatch(openChat(chatRoom));
            const message: Message = {
                content: `죄송합니다. ${recipe.title} 레시피가 공식 레시피 전환에 실패했습니다.\n기각 사유: ${reason ?? "사유 없음"}`,
                userNo: recipe.userNo,
                username: "admin",
                createdAt: new Date().toISOString(),
                roomNo: chatRoom.roomNo
            };
            sendMessage(message);
        } catch {
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    const handleResolveCh = async (formNo: number) => {
        try {
            await resolveChallenge(formNo);
            setChallenges((prev) => prev.filter((c) => c.formNo !== formNo));
            fetchChData(1);
        } catch {
            alert('처리 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className={style.container}>
            <div className={style.section}>
                <h3>회원관리 🔐</h3>
                <hr />
                {!loading && !error && userReports.length === 0 && (
                    <div className={style.emptyState}>처리할 신고 내역이 없습니다.</div>
                )}
                {userReports.map((c) => (
                    <div key={c.reportNo} className={style.card}>
                        <div className={style.cardInfo} onClick={() => handleToggleCard(c.reportNo)}>
                            <span>USER {c.refNo}</span>
                            <span>{c.detail}</span>
                            <span>{new Date(c.reportedAt).toLocaleString()}</span>
                            <span className={style.toggleIcon}>{openCards[c.reportNo] ? '▲' : '▼'}</span>
                        </div>
                        {openCards[c.reportNo] && (
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
                {userPageInfo && userPageInfo.listCount > 5 && (
                    <Pagination pageInfo={userPageInfo} onPageChange={(page) => fetchUserData(page)} />
                )}
            </div>

            <div className={style.section}>
                <h3>레시피 관리 🍳</h3>
                <hr />
                {!loading && !error && recipes.length === 0 && (
                    <div className={style.emptyState}>관리할 레시피가 없습니다.</div>
                )}
                {recipes.map((c) => (
                    <div key={`${c.rcpNo}-${c.reportNo}`} className={style.card}>
                        <div
                            className={style.cardInfo}
                            onClick={() => handleToggleCard(`${c.rcpNo}-${c.reportNo}`)}
                        >
                            <span>ID {c.rcpNo}</span>
                            <span>{c.type === 'RECIPE' ? c.title : c.detail}</span>
                            {c.type === 'REPORT' && <span>{new Date(c.reportedAt).toLocaleString()}</span>}
                            <span className={style.toggleIcon}>
                                {openCards[`${c.rcpNo}-${c.reportNo}`] ? '▲' : '▼'}
                            </span>
                        </div>
                        {openCards[`${c.rcpNo}-${c.reportNo}`] && (
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
                    <Pagination pageInfo={rcpPageInfo} onPageChange={(page) => fetchRcpData(page)} />
                )}
            </div>

            <div className={style.section}>
                <h3>커뮤니티 관리 🎮</h3>
                <hr />
                {!loading && !error && commReports.length === 0 && (
                    <div className={style.emptyState}>처리할 신고 내역이 없습니다.</div>
                )}
                {commReports.map((c) => (
                    <div key={c.reportNo} className={style.card}>
                        <div className={style.cardInfo} onClick={() => handleToggleCard(c.reportNo)}>
                            <span>ID {c.reportNo}</span>
                            <span>{c.detail}</span>
                            <span>{new Date(c.reportedAt).toLocaleString()}</span>
                            <span className={style.toggleIcon}>{openCards[c.reportNo] ? '▲' : '▼'}</span>
                        </div>
                        {openCards[c.reportNo] && (
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
                    <Pagination pageInfo={commPageInfo} onPageChange={(page) => fetchCommData(page)} />
                )}
            </div>

            <div className={style.section}>
                <h3>새 챌린지 요청 💌</h3>
                <hr />
                {!loading && !error && challenges.length === 0 && (
                    <div className={style.emptyState}>처리할 신규 요청이 없습니다.</div>
                )}
                {challenges.map((c) => (
                    <div key={c.formNo} className={style.card}>
                        <div className={style.cardInfo} onClick={() => handleToggleCard(c.formNo)}>
                            <span>ID {c.formNo}</span>
                            <span>{c.chTitle}</span>
                            <span>{new Date(c.createdAt).toLocaleString()}</span>
                            <span className={style.toggleIcon}>{openCards[c.formNo] ? '▲' : '▼'}</span>
                        </div>
                        {openCards[c.formNo] && (
                            <>
                                <div className={style.cardContent}>
                                    <strong>USER {c.userNo}</strong>
                                    <div>{c.description}</div>
                                </div>
                                <div className={style.cardActions}>
                                    <button onClick={() => handleOpenCh(c)}>상세보기</button>
                                    <button onClick={() => openConfirm(() => handleResolveCh(c.formNo))}>
                                        처리완료
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {chPageInfo && chPageInfo.listCount > 5 && (
                    <Pagination pageInfo={chPageInfo} onPageChange={(page) => fetchChData(page)} />
                )}
            </div>
            <RcpAlertModal
                open={confirmOpen}
                title="확인"
                message={confirmInput ? "사유를 입력해주세요." : "정말 진행하시겠습니까?"}
                input={confirmInput}
                onConfirm={(value) => {
                    confirmAction(value);
                    setConfirmOpen(false);
                }}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
};
