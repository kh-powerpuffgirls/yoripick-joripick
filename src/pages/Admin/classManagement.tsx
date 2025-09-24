import style from "./userManagement.module.css";
import { getClassData, getClassInfo, type PageInfo } from "../../api/adminApi";
import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";
import { ClassModal } from "../../components/Admin/classModal";

interface ClassInfo {
    roomNo: number;
    className: string;
    username: string;
    passcode: number;
    numPpl: number;
    deleteStatus: string;
};

export const ClassManagement = () => {
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [classes, setClasses] = useState<ClassInfo[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<any>(null);
    const navigate = useNavigate();

    const fetchData = async (page: number) => {
        const data = await getClassData(page, 10);
        setPageInfo(data.pageInfo);
        setClasses(data.list);
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    const handleGoToDtl = async (roomNo: number) => {
        try {
            setModalContent(await getClassInfo(roomNo));
            setIsModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch class data:", error);
            alert("쿠킹 클래스 정보를 불러오는 데 실패했습니다.");
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    };

    return (
        <div className={style.adminMain}>
            <div className={style.adminNav}>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/users`)}>USER</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/recipes`)}>RECIPE</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/communities`)}>COMMUNITY</button>
                <button className={`${style.adminNavLink} ${style.active}`}>CLASS</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/cservices`)}>CS</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/announcements`)}>ANNOUNCEMENT</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/challenges`)}>CHALLENGE</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/ingredients`)}>INGREDIENT</button>
            </div>
            <div className={style.userManagementContainer}>
                <table className={style.userTable}>
                    <thead>
                        <tr>
                            <th>클래스 번호</th>
                            <th>클래스 명</th>
                            <th>개설자</th>
                            <th>참여코드</th>
                            <th>참여자 수</th>
                            <th>삭제여부</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes && classes.length > 0 ? (
                            classes.map(c => (
                                <tr key={c.roomNo}>
                                    <td>{c.roomNo}</td>
                                    <td>{c.className}</td>
                                    <td>{c.username}</td>
                                    <td>{c.passcode}</td>
                                    <td>{c.numPpl}</td>
                                    <td>{c.deleteStatus}</td>
                                    <td className={style.actionButtons}>
                                        <button className={style.mypageButton} onClick={() => handleGoToDtl(c.roomNo)}>보기</button>
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
            {isModalOpen && modalContent && (
                <ClassModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    chatData={modalContent}
                />
            )}
        </div>
    );
};