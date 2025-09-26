import style from "./userManagement.module.css";
import { getCommunityData, type PageInfo } from "../../api/adminApi";
import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";

interface CommInfo {
    category: string;
    commNo: number;
    title: string;
    username: string;
    createdAt: string;
    views: number;
    likes: number;
};

export const CommManagement = () => {
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [comms, setComms] = useState<CommInfo[] | null>(null);
    const navigate = useNavigate();

    const fetchData = async (page: number) => {
        const data = await getCommunityData(page, 10);
        setPageInfo(data.pageInfo);
        setComms(data.list);
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    const handleGoToDtl = (category: string, commNo: number) => {
        category = category === "board" ? "free" : (category === "market" ? category + "/buyForm" : category);
        const ref = window.location.origin + `/community/${category}/${commNo}`;
        window.open(ref, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={style.adminMain}>
            <div className={style.adminNav}>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/users`)}>USER</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/recipes`)}>RECIPE</button>
                <button className={`${style.adminNavLink} ${style.active}`}>COMMUNITY</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/classes`)}>CLASS</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/cservices`)}>CS</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/announcements`)}>ANNOUNCEMENT</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/challenges`)}>CHALLENGE</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/ingredients`)}>INGREDIENT</button>
            </div>
            <div className={style.userManagementContainer}>
                <table className={style.userTable}>
                    <thead>
                        <tr>
                            <th>카테고리</th>
                            <th>게시글 번호</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>작성일</th>
                            <th>조회수</th>
                            <th>추천수</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {comms && comms.length > 0 ? (
                            comms.map(c => (
                                <tr>
                                    <td>{c.category}</td>
                                    <td>{c.commNo}</td>
                                    <td>{c.title}</td>
                                    <td>{c.username}</td>
                                    <td>{c.createdAt}</td>
                                    <td>{c.views}</td>
                                    <td>{c.likes}</td>
                                    <td className={style.actionButtons}>
                                        <button className={style.mypageButton} onClick={() => handleGoToDtl(c.category, c.commNo)}>이동</button>
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