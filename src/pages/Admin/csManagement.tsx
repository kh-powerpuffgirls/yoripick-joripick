import style from "./userManagement.module.css";
import { getCSinfo, getCustomerServices, type PageInfo } from "../../api/adminApi";
import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";
import { ClassModal } from "../../components/Admin/classModal";

interface CSinfo {
    roomNo: number;
    userNo: number;
    username: string;
    time: string;
    content: string;
};

export const CSmanagement = () => {
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [cservices, setCservices] = useState<CSinfo[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<any>(null);
    const navigate = useNavigate();

    const fetchData = async (page: number) => {
        const data = await getCustomerServices(page, 10);
        setPageInfo(data.pageInfo);
        setCservices(data.list);
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    const handleGoToDtl = async (roomNo: number) => {
        try {
            setModalContent(await getCSinfo(roomNo));
            console.log(await getCSinfo(roomNo));
            setIsModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch customer service data:", error);
            alert("고객문의 정보를 불러오는 데 실패했습니다.");
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
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/classes`)}>CLASS</button>
                <button className={`${style.adminNavLink} ${style.active}`}>CS</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/announcements`)}>ANNOUNCEMENT</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/challenges`)}>CHALLENGE</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/ingredients`)}>INGREDIENT</button>
            </div>
            <div className={style.userManagementContainer}>
                <table className={style.userTable}>
                    <thead>
                        <tr>
                            <th>문의번호</th>
                            <th>사용자ID</th>
                            <th>닉네임</th>
                            <th>마지막 대화</th>
                            <th>내용</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cservices && cservices.length > 0 ? (
                            cservices.map(c => (
                                <tr key={c.roomNo}>
                                    <td>{c.roomNo}</td>
                                    <td>{c.userNo}</td>
                                    <td>{c.username}</td>
                                    <td>{new Date(c.time).toLocaleString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false
                                    })}</td>
                                    <td>{c.content}</td>
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