import style from "./userManagement.module.css";
import { deleteChallenge, getChallengeInfos, type PageInfo } from "../../api/adminApi";
import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";
import { ImageModal } from "../../components/Admin/imageModal";
import { NewChallenge } from "../../components/Admin/newChallenge";
import { RcpAlertModal } from "../../components/Admin/rcpAlertModal";

export interface ChallengeInfo {
    chInfoNo: number;
    title: string;
    startDate: string;
    endDate: string;
    imageUrl: string;
};

export const ClngManagement = () => {
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [challenges, setChallenges] = useState<ChallengeInfo[] | null>(null);
    const navigate = useNavigate();
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [challengeToEdit, setChallengeToEdit] = useState<ChallengeInfo | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedChInfoNo, setSelectedChInfoNo] = useState<number | null>(null);
    const [modalMessage, setModalMessage] = useState<string>('');

    const fetchData = async (page: number) => {
        const data = await getChallengeInfos(page, 10);
        setPageInfo(data.pageInfo);
        setChallenges(data.list);
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    const handleDetail = (imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
        setIsImageModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsImageModalOpen(false);
        setSelectedImageUrl("");
    };

    const handleEdit = (challenge: ChallengeInfo) => {
        setChallengeToEdit(challenge);
        setIsEditModalOpen(true);
    };

    const handleSuccess = () => {
        fetchData(pageInfo?.currentPage || 1);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setChallengeToEdit(null);
    };

    const handleDelete = (chInfoNo: number) => {
        setSelectedChInfoNo(chInfoNo);
        setModalMessage('정말 이 챌린지를 삭제하시겠습니까?');
        setIsModalOpen(true);
    }

    const confirmDelete = async () => {
        if (selectedChInfoNo === null) return;
        try {
            await deleteChallenge(selectedChInfoNo);
            alert('챌린지가 성공적으로 삭제되었습니다.');
            fetchData(pageInfo?.currentPage || 1);
        } catch (error) {
            console.error("Failed to delete announcement:", error);
            alert('삭제에 실패했습니다.');
        } finally {
            setIsModalOpen(false);
            setSelectedChInfoNo(null);
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
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/announcements`)}>ANNOUNCEMENT</button>
                <button className={`${style.adminNavLink} ${style.active}`}>CHALLENGE</button>
                <button className={style.adminNavLink} onClick={() => navigate(`/admin/ingredients`)}>INGREDIENT</button>
            </div>
            <div className={style.userManagementContainer}>
                <table className={style.userTable}>
                    <thead>
                        <tr>
                            <th>챌린지 번호</th>
                            <th>내용</th>
                            <th>시작일</th>
                            <th>종료일</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {challenges && challenges.length > 0 ? (
                            challenges.map(c => (
                                <tr key={c.chInfoNo}>
                                    <td>{c.chInfoNo}</td>
                                    <td>{c.title}</td>
                                    <td>{new Date(c.startDate).toLocaleString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}</td>
                                    <td>{new Date(c.endDate).toLocaleString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}</td>
                                    <td className={style.actionButtons}>
                                        <button className={style.mypageButton} onClick={() => handleDetail(c.imageUrl)}>자세히</button>
                                        <button className={style.mypageButton} onClick={() => handleEdit(c)}>수정</button>
                                        <button className={style.mypageButton} onClick={() => handleDelete(c.chInfoNo)}>삭제</button>
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
            {isImageModalOpen && (
                <ImageModal
                    imageUrl={selectedImageUrl}
                    onClose={handleCloseModal}
                />
            )}
            {isEditModalOpen && (
                <NewChallenge
                    setOpenNewCh={handleCloseEditModal}
                    currentChallenge={challengeToEdit}
                    onSuccess={handleSuccess}
                />
            )}
            <RcpAlertModal
                open={isModalOpen}
                title="챌린지 삭제"
                message={modalMessage}
                input={false}
                onConfirm={confirmDelete}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedChInfoNo(null);
                }}
            />
        </div>
    );
};