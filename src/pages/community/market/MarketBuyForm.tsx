import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MarketBuyForm.module.css';
import CommunityHeader from '../CommunityHeader';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import BuyCompleteModal from './BuyCompleteModal';
import CommunityModal from '../CommunityModal';
import ReportModal from '../../../components/Report/ReportModal';

// API 응답 데이터 타입 정의
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
}

// Report 관련 인터페이스 정의
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

const API_BASE = 'http://localhost:8081';
const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

const MARKETPLACE_CATEGORY = 'MARKETPLACE';

const MarketBuyForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { accessToken, user } = useSelector((state: RootState) => state.auth);
    const isLoggedIn = !!accessToken;

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
        if (!isLoggedIn) {
            alert('로그인이 필요합니다.');
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        const fetchItem = async () => {
            if (!id) {
                setError('게시글 ID가 유효하지 않습니다.');
                return;
            }
            try {
                const response = await api.get(`/community/market/${id}`);
                setItem(response.data);
                if (response.data.quantity === 0) {
                    setFormData(prev => ({ ...prev, quantity: 0 }));
                } else {
                    setFormData(prev => ({ ...prev, quantity: 1 }));
                }
            } catch (err) {
                console.error("Failed to fetch item details:", err);
                setError('상품 정보를 불러오는데 실패했습니다.');
                setItem(null);
            }
        };
        fetchItem();
    }, [id]);

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
        setIsConfirmModalOpen(true);
    };

    const handleConfirm = async () => {
        setIsConfirmModalOpen(false);
        setError(null);

        if (!isLoggedIn || !accessToken || !user) {
            setError('로그인 상태가 유효하지 않습니다. 다시 로그인해주세요.');
            return;
        }

        if (!item) {
            setError('상품 정보가 없습니다.');
            return;
        }

        const buyData = {
            productId: Number(id),
            userNo: user.userNo,
            count: formData.quantity,
            dlvrName: formData.receiverName,
            buyerPhone: formData.receiverPhone,
            address: formData.shippingAddress,
            detailAddress: formData.shippingDetail,
            buyerName: formData.depositorName
        };

        try {
            await api.post('/community/market/buy', buyData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            });
            setIsCompleteModalOpen(true);
        } catch (err) {
            const axiosError = err as AxiosError;
            console.error("Failed to submit buy form:", axiosError.response || axiosError);
            if (axiosError.response?.status === 401) {
                setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
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

    // 신고 기능
    const handleReportClick = async () => {
        if (!item || !user) {
            openCommunityModal({ message: '신고에 필요한 정보가 부족합니다.', onConfirm: closeCommunityModal, showCancel: false });
            return;
        }

        if (item.userNo === user.userNo) {
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
        if (!user?.userNo || !reportTargetInfo) {
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
                                <span className={styles.profileIcon}></span>
                                <span>{user?.username || '사용자'}</span>
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
                            <button type="button" className={styles.reportButton} onClick={handleReportClick}>신고하기</button>
                            <button type="button" className={styles.cancelButton} onClick={() => navigate(-1)}>취소</button>
                            <button type="submit" className={styles.submitButton} disabled={item.quantity === 0}>구매 신청</button>
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