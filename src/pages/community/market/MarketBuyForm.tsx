import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MarketBuyForm.module.css';
import CommunityHeader from '../Header/CommunityHeader';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { store } from '../../../store/store';
import BuyCompleteModal from './BuyCompleteModal';
import CommunityModal from '../CommunityModal';
import ReportModal from '../../../components/Report/ReportModal';

const API_BASE = 'http://localhost:8081';

const getAccessToken = () => store.getState().auth.accessToken;

const api = axios.create({
    baseURL: API_BASE,
});

api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => Promise.reject(error),
);

interface MarketItem {
    productId: number;
    title: string;
    detail: string;
    imageUrl: string;
    name: string;
    price: number;
    quantity: number;
    phone: string;
    accountNo: string;
    deadline: string;
    alwaysOnSale: boolean;
    userNo: number; 
    username: string; 
    author: string;
    authorProfileUrl?: string;
    isPurchased: string;
}

interface ReportTargetInfo {
    author: string;
    title: string;
    category: string;
    refNo: number;
}

interface ReportOption {
    reportType: string;
    category: string;
    detail: string;
}

const MARKETPLACE_CATEGORY = 'MARKETPLACE';

const MarketBuyForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth); 
    const isLoggedIn = user; 
    const userNo = user?.userNo;

    const [item, setItem] = useState<MarketItem | null>(null);
    const [formData, setFormData] = useState({
        quantity: 1,
        receiverName: '',
        receiverPhone: '',
        shippingAddress: '',
        shippingDetail: '',
        depositorName: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [totalPrice, setTotalPrice] = useState(0);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportTargetInfo, setReportTargetInfo] = useState<ReportTargetInfo | null>(null);
    const [reportOptions, setReportOptions] = useState<ReportOption[]>([]);
    
    const [communityModal, setCommunityModal] = useState<{ message: string; onConfirm?: () => void; showCancel?: boolean } | null>(null);
    const openCommunityModal = (modalData: { message: string; onConfirm?: () => void; showCancel?: boolean }) => setCommunityModal(modalData);
    const closeCommunityModal = () => setCommunityModal(null);
    const handleCommunityModalConfirm = () => { communityModal?.onConfirm?.(); closeCommunityModal(); };


    useEffect(() => {
        const fetchItem = async () => {
            if (!id) {
                setError('게시글 ID가 유효하지 않습니다.');
                return;
            }
            try {
                const response = await api.get<MarketItem>(`/community/market/${id}`); 
                const fetchedItem = response.data;
                setItem(fetchedItem);
            
            } catch (err) {
                console.error("Failed to fetch item details:", err);
                setError('상품 정보를 불러오는데 실패했습니다.');
                setItem(null);
            }
        };
        fetchItem();
    }, [id, user, userNo]);

    useEffect(() => {
        if (item) {
            setTotalPrice(item.price * formData.quantity);
        }
    }, [formData.quantity, item]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleQuantityChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setFormData({
            ...formData,
            quantity: Number(e.target.value),
        });
    };

    const handleAddressSearch = () => {
        new (window as any).daum.Postcode({
            oncomplete: (data: any) => {
                let fullAddress = data.address;
                let extraAddress = '';

                if (data.addressType === 'R') {
                    if (data.bname !== '') {
                        extraAddress += data.bname;
                    }
                    if (data.buildingName !== '') {
                        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
                    }
                    fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
                }

                setFormData({
                    ...formData,
                    shippingAddress: fullAddress,
                    shippingDetail: '',
                });
            }
        }).open();
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        if (item && userNo === item.userNo) { 
            openCommunityModal({ 
                message: '본인이 등록한 상품은 구매 신청할 수 없습니다.', 
                onConfirm: closeCommunityModal, 
                showCancel: false 
            });
            return;
        }
        
        setIsConfirmModalOpen(true);
    };

    const handleSoftDelete = async () => {
        if (!id || !userNo || !item || userNo !== item.userNo) {
            openCommunityModal({ message: '삭제 권한이 없거나 정보가 유효하지 않습니다.', onConfirm: closeCommunityModal, showCancel: false });
            return;
        }

        openCommunityModal({ 
            message: '정말로 이 게시글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.', 
            onConfirm: async () => {
                try {
                    await api.delete(`/community/market/${id}`); 
                    
                    openCommunityModal({ message: '게시글이 삭제되었습니다.', onConfirm: () => navigate('/community/market'), showCancel: false });
                } catch (err) {
                    const axiosError = err as AxiosError;
                    console.error('Failed to delete post:', axiosError.response || axiosError);
                    const errorMessage = (axiosError.response?.data as any)?.message || '게시글 삭제에 실패했습니다.';
                    openCommunityModal({ message: errorMessage, onConfirm: closeCommunityModal, showCancel: false });
                }
            },
            showCancel: true
        });
    };

    const handleConfirm = async () => {
        setIsConfirmModalOpen(false);
        setError(null);
        
        console.log(user);

        if (!isLoggedIn || !userNo) {
            setError('로그인 상태가 유효하지 않습니다. 다시 로그인해주세요.');
            openCommunityModal({ 
                message: '로그인이 만료되었습니다. 다시 로그인해주세요.', 
                onConfirm: () => navigate('/login'), 
                showCancel: false 
            });
            return;
        }

        if (!item) {
            setError('상품 정보가 없습니다.');
            return;
        }

        const buyData = {
            productId: Number(id),
            userNo: userNo,
            count: formData.quantity,
            dlvrName: formData.receiverName,
            buyerPhone: formData.receiverPhone,
            address: formData.shippingAddress,
            detailAddress: formData.shippingDetail,
            buyerName: formData.depositorName
        };

        console.log(buyData);
        try {
            await api.post('/community/market/buy', buyData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setIsCompleteModalOpen(true);
        } catch (err) {
            const axiosError = err as AxiosError;
            console.error("Failed to submit buy form:", axiosError.response || axiosError);
            if (axiosError.response?.status === 401) {
                setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
                 openCommunityModal({ 
                    message: '로그인이 만료되었습니다. 다시 로그인해주세요.', 
                    onConfirm: () => navigate('/login'), 
                    showCancel: false 
                });
            } else if (axiosError.response?.data) {
                setError((axiosError.response.data as any).message || '구매 신청에 실패했습니다.');
            } else {
                setError('구매 신청에 실패했습니다.');
            }
        }
    };
    
    const handleCompleteModalClose = () => {
        setIsCompleteModalOpen(false);
        navigate('/community/market');
    };

    const handleReportClick = async () => {
        if (!item || !userNo) { 
            openCommunityModal({ message: '신고에 필요한 정보가 부족하거나, 로그인 후 이용 가능합니다.', onConfirm: closeCommunityModal, showCancel: false });
            return;
        }

        if (item.userNo === userNo) {
            openCommunityModal({ message: '자신의 게시물은 신고할 수 없습니다.', onConfirm: closeCommunityModal, showCancel: false });
            return;
        }
        
        const category = MARKETPLACE_CATEGORY;
        const targetInfo: ReportTargetInfo = {
            author: item.username,
            title: item.title,
            category,
            refNo: item.productId,
        };

        setReportTargetInfo(targetInfo);

        try {
            const res = await api.get<ReportOption[]>(`/community/report/types`); 
            const filteredOptions = res.data.filter(option => option.category === category);
            setReportOptions(filteredOptions);
            setIsReportModalOpen(true);
        } catch (err) {
            console.error('신고 옵션 fetch 실패:', err);
            setReportOptions([]); 
            openCommunityModal({ message: '신고 옵션 로드 실패', onConfirm: closeCommunityModal, showCancel: false });
        }
    };

    const handleReportSubmit = async (reportType: string, content: string, refNo: number) => { 
        if (!userNo || !reportTargetInfo) { 
            openCommunityModal({ message: '로그인 후 신고 가능합니다.', onConfirm: closeCommunityModal, showCancel: false });
            return;
        }
        try {
            await api.post(`/community/report`, {
                reportType,
                content,
                refNo,
                refType: MARKETPLACE_CATEGORY
            });
            openCommunityModal({ message: '신고가 접수되었습니다.', onConfirm: closeCommunityModal, showCancel: false });
            setIsReportModalOpen(false);
            setReportTargetInfo(null);
        } catch (err: any) {
            console.error(err);
            openCommunityModal({ message: err.response?.data?.message || '신고 실패', onConfirm: closeCommunityModal, showCancel: false });
            setIsReportModalOpen(false);
            setReportTargetInfo(null);
        }
    };

    if (error) {
        return <div className={styles.loading}>{error}</div>;
    }

    if (!item) {
        return <div className={styles.loading}>상품 정보를 불러오는 중입니다...</div>;
    }

    const stockOptions = Array.from({ length: item.quantity }, (_, i) => i + 1);

    return (
        <>
            <CommunityHeader/>
            <div className={styles.container}>
                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formHeader}>
    <input
        type="text"
        className={styles.titleInput}
        value={item.title}
        readOnly
    />
    <div className={styles.authorInfo}>
        {item.authorProfileUrl ? (
            <img src={`${API_BASE}${item.authorProfileUrl}`} alt={`${item.author}의 프로필`} className={styles.profileImage} />
        ) : (
            <span className={styles.profileIcon}></span>
        )}
        <span>{item.author}</span>
        <span className={styles.date}>{new Date().toLocaleDateString()}</span>
    </div>
</div>

                        <div className={styles.imageUploadSection}>
                            <div className={styles.imageBox}>
                                <img src={item.imageUrl} alt={item.name} className={styles.imagePreview} />
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>게시글 내용</h2>
                            </div>
                            <textarea className={styles.descriptionTextarea} value={item.detail} readOnly></textarea>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>판매자 정보</h2>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>전화번호</span>
                                <input type="text" className={styles.detailInput} value={item.phone} readOnly />
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>계좌번호</span>
                                <input type="text" className={styles.detailInput} value={item.accountNo} readOnly />
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>구매 정보</h2>
                            </div>
                            <div className={styles.itemInfo}>
                                <div className={styles.itemImageContainer}>
                                    <img src={item.imageUrl} alt={item.name} className={styles.itemImagePreview} />
                                </div>
                                <div className={styles.itemDetails}>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>상품명</span>
                                        <input type="text" className={styles.detailInput} value={item.name} readOnly />
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>가격</span>
                                        <input type="text" className={styles.detailInput} value={item.price.toLocaleString()} readOnly />
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>수량</span>
                                        {item.quantity > 0 ? (
                                            <select className={styles.detailInput} name="quantity" value={formData.quantity} onChange={handleQuantityChange}>
                                                {stockOptions.map(num => (
                                                    <option key={num} value={num}>{num}개</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={styles.outOfStock}>재고 없음</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>총 결제 금액</h2>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>총 금액</span>
                                <input type="text" className={styles.detailInput} value={totalPrice.toLocaleString()} readOnly />
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>배송지</h2>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>받는사람</span>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    placeholder="이름을 입력해주세요"
                                    name="receiverName"
                                    value={formData.receiverName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>전화번호</span>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    placeholder="연락 가능한 전화번호를 입력해주세요"
                                    name="receiverPhone"
                                    value={formData.receiverPhone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>주소</span>
                                <div className={styles.addressInputContainer}>
                                    <input
                                        type="text"
                                        className={styles.inputField}
                                        placeholder="주소를 검색해주세요"
                                        name="shippingAddress"
                                        value={formData.shippingAddress}
                                        onChange={handleInputChange}
                                        required
                                        readOnly
                                    />
                                    <button type="button" onClick={handleAddressSearch} className={styles.imageUploadBtn}>우편번호 찾기</button>
                                </div>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>상세주소</span>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    placeholder="상세 주소를 입력해주세요"
                                    name="shippingDetail"
                                    value={formData.shippingDetail}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>입금 정보</h2>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>예금주명</span>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    placeholder="입금하실 예금주명을 입력해주세요"
                                    name="depositorName"
                                    value={formData.depositorName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        {error && <div className={styles.errorBox}>{error}</div>}
                            <div className={styles.buttonGroup}>
                            {isLoggedIn && userNo === item.userNo ? (
                            <>
                                {item.isPurchased === 'N' && (
                                    <button 
                                        type="button" 
                                        className={styles.editButton} 
                                        onClick={() => navigate(`/community/market/edit/${id}`)}>
                                        게시글 수정
                                    </button>
                                )}
                                <button type="button" className={styles.deleteButton} onClick={handleSoftDelete}>게시글 삭제</button>
                                <button type="button" className={styles.cancelButton} onClick={() => navigate(-1)}>취소</button>
                            </>
                            ) : (
                            <>
                                <button type="button" className={styles.reportButton} onClick={handleReportClick}>신고하기</button>
                                <button type="button" className={styles.cancelButton} onClick={() => navigate(-1)}>취소</button> 
                                <button 
                                type="submit" 
                                className={styles.submitButton} 
                                disabled={item.quantity === 0} 
                                >
                                    {item.quantity === 0 
                                        ? '재고 없음'
                                        : '구매 신청'}
                                </button>
                            </>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {isConfirmModalOpen && item && (
                <BuyCompleteModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={handleConfirm}
                    itemName={item.name}
                    totalPrice={totalPrice}
                    accountNo={item.accountNo}
                    isComplete={false}
                />
            )}

            {isCompleteModalOpen && item && (
                <BuyCompleteModal
                    isOpen={isCompleteModalOpen}
                    onClose={handleCompleteModalClose}
                    onConfirm={() => {}}
                    itemName={item.name}
                    totalPrice={totalPrice}
                    accountNo={item.accountNo}
                    isComplete={true}
                />
            )}

            {isReportModalOpen && reportTargetInfo && (
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => { setIsReportModalOpen(false); setReportTargetInfo(null); }}
                    onSubmit={handleReportSubmit}
                    reportOptions={reportOptions}
                    targetInfo={reportTargetInfo}
                />
            )}

            {communityModal && (
                <CommunityModal
                    message={communityModal.message}
                    onConfirm={handleCommunityModalConfirm}
                    showCancel={communityModal.showCancel}
                    onClose={closeCommunityModal} 
                />
            )}
        </>
    );
};

export default MarketBuyForm;