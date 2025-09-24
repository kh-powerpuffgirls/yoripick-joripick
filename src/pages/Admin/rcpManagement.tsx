import style from "./userManagement.module.css";
import { getRecipes, type PageInfo } from "../../api/adminApi";
import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";

interface RcpInfo {
    rcpNo: number;
    rcpName: string;
    views: number;
    approval: string;
    likes: number;
    dislikes: number;
    bookmarks: number;
};

export const RcpManagement = () => {
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [recipes, setRecipes] = useState<RcpInfo[] | null>(null);
    const navigate = useNavigate();

    const fetchData = async (page: number) => {
        const data = await getRecipes(page, 10);
        setPageInfo(data.pageInfo);
        setRecipes(data.list);
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    const handleGoToDtl = (rcpNo: number) => {
        navigate(`/recipe/${rcpNo}`);
    };

    return (
        <div className={style.adminMain}>
            <div className={style.adminNav}>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/users`)}>USER</button>
                <button className={`${style.adminNavLink} ${style.active}`}>RECIPE</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/communities`)}>COMMUNITY</button>
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
                            <th>레시피 번호</th>
                            <th>메뉴명</th>
                            <th>조회수</th>
                            <th>추천수</th>
                            <th>비추천 수</th>
                            <th>공식승인</th>
                            <th>북마크 수</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {recipes && recipes.length > 0 ? (
                            recipes.map(r => (
                                <tr key={r.rcpNo}>
                                    <td>ID {r.rcpNo}</td>
                                    <td>{r.rcpName}</td>
                                    <td>{r.views}</td>
                                    <td>{r.likes}</td>
                                    <td>{r.dislikes}</td>
                                    <td>{r.approval}</td>
                                    <td>{r.bookmarks}</td>
                                    <td className={style.actionButtons}>
                                        <button className={style.mypageButton} onClick={() => handleGoToDtl(r.rcpNo)}>이동</button>
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