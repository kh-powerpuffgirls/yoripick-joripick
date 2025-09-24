import style from "./userManagement.module.css";
import { getIngredients, type PageInfo } from "../../api/adminApi";
import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";

export interface IngredientInfo {
    ingNo: number;
    ingName: string;
    ingCodeName: string;
};

export const IngManagement = () => {
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [ingredients, setIngredients] = useState<IngredientInfo[] | null>(null);
    const navigate = useNavigate();

    const fetchData = async (page: number) => {
        const data = await getIngredients(page, 10);
        setPageInfo(data.pageInfo);
        setIngredients(data.list);
    };

    useEffect(() => {
        fetchData(1);
    }, []);

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
                <button className={`${style.adminNavLink} ${style.active}`}>INGREDIENT</button>
            </div>
            <div className={style.userManagementContainer}>
                <table className={style.userTable}>
                    <thead>
                        <tr>
                            <th>식재료 번호</th>
                            <th>재료명</th>
                            <th>분류</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {ingredients && ingredients.length > 0 ? (
                            ingredients.map(i => (
                                <tr>
                                    <td>{i.ingNo}</td>
                                    <td>{i.ingName}</td>
                                    <td>{i.ingCodeName}</td>
                                    <td className={style.actionButtons}>
                                        <button className={style.mypageButton} >이동</button>
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