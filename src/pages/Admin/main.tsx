import { useEffect, useState } from 'react';
import style from './main.module.css'
import { approveRecipe, disproveRecipe, fetchChallenges, fetchCommReports, fetchRecipes, fetchUserReports, resolveChallenge, resolveReport, type ChallengeForm, type PageInfo, type Recipe, type Reports } from '../../api/adminApi';
import Pagination from '../../components/Pagination';
import { hideAlert, showAlert } from '../../features/alertSlice';
import { useDispatch } from 'react-redux';
import { openChat } from '../../features/chatSlice';

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
    const dispatch = useDispatch();

    const handleToggleCard = (id: number | string) => {
        setOpenCards(prev => ({
            ...prev,
            [id]: !prev[id]
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
    }
    const fetchChData = async (page: number) => {
        const data = await fetchChallenges(page, 5);
        setChallenges(data.list);
        setChPageInfo(data.pageInfo);
    }
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

    const handleUserBan = (userNo: number) => {

    };

    const handleOpenReport = (c: Reports) => {
        if (c.category === "COOKING_CLASS") {
            // 쿠킹클래스 내용 전부 조회해와서 화면에 따로 출력
            return;
        }
        let ref = window.location.origin + "/";
        if (c.category === 'BOARD') ref += "";
        if (c.category === 'MARKETPLACE') ref += "";
        if (c.category === 'REPLY') {
            // 백엔드에서 parentNo 조회해오기, css로 focus 주기
            ref += "";
        }
        if (c.category === 'REVIEW') {
            // 백엔드에서 parentNo 조회해오기, css로 focus 주기
            ref += "";
        }
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
        if (!confirm('해당 신고 내역을 완료 처리하시겠습니까?')) return;
        try {
            await resolveReport(report.reportNo);
            if ("category" in report) {
                if (report.category === 'USERS') {
                    setUserReports(prev => prev.filter(c => c.reportNo !== report.reportNo));
                    fetchUserData(1);
                } else if (report.category !== 'USERS') {
                    setCommReports(prev => prev.filter(c => c.reportNo !== report.reportNo));
                    fetchCommData(1);
                }
            } else {
                setRecipes(prev => prev.filter(c => c.reportNo !== report.reportNo));
                fetchRcpData(1);
            }
        } catch {
            alert('처리 중 오류가 발생했습니다.');
        }
    };
    const openChatRcp = (userNo: number, message: string) => {
        dispatch(openChat())
    };
    const openResolveRcpModal = async (recipe: Recipe) => {
        const disproveRecipeFn = async (message: string) => {
            try {
                await disproveRecipe(recipe.rcpNo);
                setRecipes(prev => prev.filter(c => c.rcpNo !== recipe.rcpNo && !c.reportNo));
                fetchRcpData(1);
                openChatRcp(recipe.userNo, `죄송합니다. ${recipe.title} 레시피가 공식 레시피 전환에 실패했습니다!
                    기각 사유는 다음과 같습니다: ${message}`);
            } catch {
                alert('처리 중 오류가 발생했습니다.');
            }
        }
        dispatch(showAlert(
            <>
                <h3>레시피 작성자에게 전달할 내용을 입력해주세요.</h3>
                <input type="text" name="reason" id="reason" />
                <button onClick={() => disproveRecipeFn(reason.value)}>기각</button>
                <button onClick={() => dispatch(hideAlert())}>취소</button>
            </>
        ))
    };
    const handleResolveRcp = async (recipe: Recipe) => {
        if (!confirm('이 레시피의 공식화 요청을 승인하시겠습니까?')) return;
        try {
            await approveRecipe(recipe.rcpNo);
            setRecipes(prev => prev.filter(c => c.rcpNo !== recipe.rcpNo && !c.reportNo));
            fetchRcpData(1);
            openChatRcp(recipe.userNo, `축하합니다. ${recipe.title} 레시피가 공식 레시피로 전환되었습니다!
                    감사합니다^.^ 앞으로도 활발한 요리 활동 부탁드립니다 ㅎㅎ`);
        } catch {
            alert('처리 중 오류가 발생했습니다.');
        }
    };
    const handleResolveCh = async (formNo: number) => {
        if (!confirm('이 챌린지 요청을 완료 처리하시겠습니까?')) return;
        try {
            await resolveChallenge(formNo);
            setChallenges(prev => prev.filter(c => c.formNo !== formNo));
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
                {!loading && !error && userReports.length === 0 &&
                    <div className={style.emptyState}>처리할 신고 내역이 없습니다.</div>}
                {userReports.map(c => (
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
                                    <button onClick={() => handleUserBan(c.refNo)}>상세보기</button>
                                    <button onClick={() => handleResolve(c)}>처리완료</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {userPageInfo && userPageInfo.listCount > 5 && (
                    <Pagination
                        pageInfo={userPageInfo}
                        onPageChange={(page) => fetchUserData(page)}
                    />
                )}
            </div>

            <div className={style.section}>
                <h3>레시피 관리 🍳</h3>
                <hr />
                {!loading && !error && recipes.length === 0 &&
                    <div className={style.emptyState}>관리할 레시피가 없습니다.</div>}
                {recipes.map(c => (
                    <div key={`${c.rcpNo}-${c.reportNo}`} className={style.card}>
                        <div className={style.cardInfo} onClick={() => handleToggleCard(`${c.rcpNo}-${c.reportNo}`)}>
                            <span>ID {c.rcpNo}</span>
                            <span>{c.type === 'RECIPE' ? c.title : c.detail}</span>
                            {c.type === 'REPORT' && (
                                <span>{new Date(c.reportedAt).toLocaleString()}</span>
                            )}
                            <span className={style.toggleIcon}>{openCards[`${c.rcpNo}-${c.reportNo}`] ? '▲' : '▼'}</span>
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
                                        <button onClick={() => handleResolve(c)}>처리완료</button>
                                    ) : (
                                        <>
                                            <button onClick={() => handleResolveRcp(c)}>승인</button>
                                            <button onClick={() => openResolveRcpModal(c)}>기각</button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {rcpPageInfo && rcpPageInfo.listCount > 5 && (
                    <Pagination
                        pageInfo={rcpPageInfo}
                        onPageChange={(page) => fetchRcpData(page)}
                    />
                )}
            </div>

            <div className={style.section}>
                <h3>커뮤니티 관리 🎮</h3>
                <hr />
                {!loading && !error && commReports.length === 0 &&
                    <div className={style.emptyState}>처리할 신고 내역이 없습니다.</div>}
                {commReports.map(c => (
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
                                    <button onClick={() => handleResolve(c)}>처리완료</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {commPageInfo && commPageInfo.listCount > 5 && (
                    <Pagination
                        pageInfo={commPageInfo}
                        onPageChange={(page) => fetchCommData(page)}
                    />
                )}
            </div>

            <div className={style.section}>
                <h3>새 챌린지 요청 💌</h3>
                <hr />
                {!loading && !error && challenges.length === 0 &&
                    <div className={style.emptyState}>처리할 신규 요청이 없습니다.</div>}
                {challenges.map(c => (
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
                                    <button onClick={() => handleResolveCh(c.formNo)}>처리완료</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {chPageInfo && chPageInfo.listCount > 5 && (
                    <Pagination
                        pageInfo={chPageInfo}
                        onPageChange={(page) => fetchChData(page)}
                    />
                )}
            </div>
        </div>
    )
}