import style from "./userManagement.module.css";
import { banUser, getUsers, type PageInfo } from "../../api/adminApi";
import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";

interface UserInfo {
    userNo: number;
    userName: string;
    status: string;
    banDays: number;
    reportNo: number;
    officialRcp: number;
    chRequest: number;
};

export const UserManagement = () => {
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [users, setUsers] = useState<UserInfo[] | null>(null);
    const [activeBanDropdown, setActiveBanDropdown] = useState<number | null>(null);
    const navigate = useNavigate();

    const fetchData = async (page: number) => {
        const data = await getUsers(page, 10);
        setPageInfo(data.pageInfo);
        setUsers(data.list);
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    // 마이페이지 버튼 클릭 핸들러
    const handleGoToMyPage = (userNo: number) => {
        navigate(`/mypage/${userNo}`);
    };

    // 정지 버튼 클릭 핸들러
    const handleToggleBanDropdown = (userNo: number) => {
        setActiveBanDropdown(prev => (prev === userNo ? null : userNo));
    };

    // 정지 일수 선택 핸들러
    const handleBanUser = async (userNo: number, days: string) => {
        try {
            await banUser(userNo, days);
            await fetchData(pageInfo?.currentPage || 1);
            console.log(`User ${userNo} will be banned for ${days} days.`);
            alert(`${userNo}번 회원을 ${days}일간 정지 처리했습니다.`);
        } catch {
            alert(`에러 발생`);
        } finally {
            setActiveBanDropdown(null);
        }
    };

    return (
        <div className={style.adminMain}>
            <div className={style.adminNav}>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin`)}>DASHBOARD</button>
                <button className={`${style.adminNavLink} ${style.active}`}>USER</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/recipes`)}>RECIPE</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/communities`)}>COMMUNITY</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/classes`)}>CLASS</button>
                <button className={style.adminNavLink}>고객문의</button>
            </div>
            <div className={style.userManagementContainer}>
                <table className={style.userTable}>
                    <thead>
                        <tr>
                            <th>회원 번호</th>
                            <th>닉네임</th>
                            <th>활성화 상태</th>
                            <th>정지 일수</th>
                            <th>신고 건수</th>
                            <th>공식 레시피</th>
                            <th>챌린지 요청</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users && users.length > 0 ? (
                            users.map(u => (
                                <tr>
                                    <td>USER {u.userNo}</td>
                                    <td>{u.userName}</td>
                                    <td>{u.status}</td>
                                    <td>{u.banDays}</td>
                                    <td>{u.reportNo}</td>
                                    <td>{u.officialRcp}</td>
                                    <td>{u.chRequest}</td>
                                    <td className={style.actionButtons}>
                                        <button className={style.mypageButton} onClick={() => handleGoToMyPage(u.userNo)}>마이페이지</button>
                                        <div className={style.dropdownContainer}>
                                            <button
                                                className={style.banButton}
                                                onClick={() => handleToggleBanDropdown(u.userNo)}>정지</button>
                                            {activeBanDropdown === u.userNo && (
                                                <div className={style.banDropdown}>
                                                    <button onClick={() => handleBanUser(u.userNo, "3")}>3일</button>
                                                    <button onClick={() => handleBanUser(u.userNo, "7")}>7일</button>
                                                    <button onClick={() => handleBanUser(u.userNo, "30")}>30일</button>
                                                    <button onClick={() => handleBanUser(u.userNo, "365")}>365일</button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center' }}>데이터가 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {pageInfo && pageInfo.listCount > 0 && (
                    <Pagination pageInfo={pageInfo} onPageChange={(page) => fetchData(page)} />
                )}
            </div>
        </div>
    );
};