import style from "./userManagement.module.css";
import { deleteAnnouncement, getAnnouncements, type PageInfo } from "../../api/adminApi";
import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";
import { RcpAlertModal } from "../../components/Admin/rcpAlertModal";
import { NewAnnouncement } from "../../components/Admin/newAnnouncement";

interface Announcement {
    ancmtNo: number;
    content: string;
    startDate: string;
    endDate: string;
};

export const AnnManagement = () => {
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAncmtNo, setSelectedAncmtNo] = useState<number | null>(null);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [isNewAnnModalOpen, setIsNewAnnModalOpen] = useState(false);
    const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);

    const fetchData = async (page: number) => {
        try {
            const data = await getAnnouncements(page, 10);
            setPageInfo(data.pageInfo);
            setAnnouncements(data.list);
        } catch {
            setAnnouncements(null);
        }
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    const handleEdit = (announcement: Announcement) => {
        setAnnouncementToEdit(announcement);
        setIsNewAnnModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsNewAnnModalOpen(false);
        setAnnouncementToEdit(null);
    };

    const handleSuccess = () => {
        fetchData(pageInfo?.currentPage || 1);
    };

    const handleDelete = (ancmtNo: number) => {
        setSelectedAncmtNo(ancmtNo);
        setModalMessage('정말 이 공지사항을 삭제하시겠습니까?');
        setIsModalOpen(true);
    }

    const confirmDelete = async () => {
        if (selectedAncmtNo === null) return;
        try {
            await deleteAnnouncement(selectedAncmtNo);
            alert('공지사항이 성공적으로 삭제되었습니다.');
            fetchData(pageInfo?.currentPage || 1);
        } catch (error) {
            console.error("Failed to delete announcement:", error);
            alert('삭제에 실패했습니다.');
        } finally {
            setIsModalOpen(false);
            setSelectedAncmtNo(null);
        }
    };

    return (
        <div className={style.adminMain}>
            <div className={style.adminNav}>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/users`)}>USER</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/recipes`)}>RECIPE</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/communities`)}>COMMUNITY</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/classes`)}>CLASS</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/cservices`)}>CS</button>
                <button className={`${style.adminNavLink} ${style.active}`}>ANNOUNCEMENT</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/challenges`)}>CHALLENGE</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/ingredients`)}>INGREDIENT</button>
            </div>
            <div className={style.userManagementContainer}>
                <table className={style.userTable}>
                    <thead>
                        <tr>
                            <th>공지번호</th>
                            <th>내용</th>
                            <th>시작일</th>
                            <th>종료일</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {announcements && announcements.length > 0 ? (
                            announcements.map(a => (
                                <tr key={a.ancmtNo}>
                                    <td>{a.ancmtNo}</td>
                                    <td>{a.content}</td>
                                    <td>{new Date(a.startDate).toLocaleString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}</td>
                                    <td>{new Date(a.endDate).toLocaleString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}</td>
                                    <td className={style.actionButtons}>
                                        <button className={style.mypageButton} onClick={() => handleEdit(a)}>수정</button>
                                        <button className={style.mypageButton} onClick={() => handleDelete(a.ancmtNo)}>삭제</button>
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
            {isNewAnnModalOpen && (
                <NewAnnouncement
                    setOpenNewAnn={handleCloseModal}
                    currentAnnouncement={announcementToEdit}
                    onSuccess={handleSuccess}
                />
            )}
            <RcpAlertModal
                open={isModalOpen}
                title="공지사항 삭제"
                message={modalMessage}
                input={false}
                onConfirm={confirmDelete}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedAncmtNo(null);
                }}
            />
        </div>
    );
};