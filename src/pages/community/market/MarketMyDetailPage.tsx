import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MarketBuyForm.module.css';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import CommunityModal from '../CommunityModal';
import ReportModal from '../../../components/Report/ReportModal';
import { store } from '../../../store/store';
import CommunityHeader from '../CommunityHeader';

const getAccessToken = () => store.getState().auth.accessToken;
const api = axios.create({
  baseURL: 'http://localhost:8081',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

interface MarketBuyDto {
  formNo: number;
  productId: number;
  count: number;
  buyerName: string;
  dlvrName: string;
  address: string;
  detailAddress: string;
  buyerPhone: string;
  buyerUserNo: number;
  createdAt: string;
}

interface MarketSellDto {
  productId: number;
  userNo: number;
  title: string;
  name: string;
  detail: string;
  price: number;
  quantity: number;
  createdAt: string;
  deadline: string;
  phone: string;
  accountNo: string;
  views: number;
  deleteStatus: string;
  author: string;
  authorProfileUrl: string;
  sikBti: string;
  imageUrl: string;
  alwaysOnSale: boolean;
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

const MarketMyDetailPage = () => {
  const { formId: formNo } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<MarketBuyDto | null>(null);
  const [sellData, setSellData] = useState<MarketSellDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTargetInfo, setReportTargetInfo] = useState<ReportTargetInfo | null>(null);
  const [reportOptions, setReportOptions] = useState<ReportOption[]>([]);
  const [communityModal, setCommunityModal] = useState<{ message: string; onConfirm?: () => void; showCancel?: boolean } | null>(null);

  const openCommunityModal = (modalData: { message: string; onConfirm?: () => void; showCancel?: boolean }) => setCommunityModal(modalData);
  const closeCommunityModal = () => setCommunityModal(null);
  const handleCommunityModalConfirm = () => {
    communityModal?.onConfirm?.();
    closeCommunityModal();
  };

  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);

      if (!formNo || isNaN(Number(formNo))) {
        openCommunityModal({
          message: '잘못된 접근입니다. 올바른 구매 폼 ID가 아닙니다.',
          showCancel: false,
          onConfirm: () => navigate(-1),
        });
        setLoading(false);
        return;
      }

      try {
        const buyResponse = await api.get<MarketBuyDto>(`/community/market/sell-buy-form/${formNo}`);
        const buyData = buyResponse.data;

        const sellResponse = await api.get<MarketSellDto>(`/community/market/${buyData.productId}`);
        const sellData = sellResponse.data;

        setFormData(buyData);
        setSellData(sellData);
        setLoading(false);
      } catch (err) {
        const axiosError = err as AxiosError;
        if (axiosError.response?.status === 401) {
          setError('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        } else if (axiosError.response?.status === 404) {
          setError('구매 폼 정보를 찾을 수 없거나 권한이 없습니다.');
        } else {
          setError('데이터를 불러오는 데 실패했습니다.');
        }
        setLoading(false);
      }
    };

    if (user?.userNo) {
      fetchFormData();
    } else if (user === null) {
      setError('로그인이 필요합니다.');
      setLoading(false);
    }
  }, [formNo, user, navigate]);

  const handleDeleteClick = () => {
    if (!formNo) {
      console.error('Form ID is missing.');
      return;
    }

    openCommunityModal({
      message: '정말로 이 구매 폼을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.',
      showCancel: true,
      onConfirm: async () => {
        try {
          await api.delete(`/community/market/delete-buy-form/${formNo}`);
          openCommunityModal({
            message: '구매 폼이 성공적으로 삭제되었습니다.',
            showCancel: false,
            onConfirm: () => navigate('/community/market'),
          });
        } catch (err) {
          const axiosError = err as AxiosError;
          let errorMessage = '구매 폼 삭제에 실패했습니다.';
          if (axiosError.response) {
            switch (axiosError.response.status) {
              case 401:
                errorMessage = '로그인 세션이 만료되었습니다. 다시 로그인해주세요.';
                break;
              case 403:
                errorMessage = '삭제 권한이 없습니다. 해당 폼의 판매자만 삭제할 수 있습니다.';
                break;
              case 404:
                errorMessage = '요청한 구매 폼을 찾을 수 없습니다.';
                break;
              default:
                errorMessage = axiosError.response.data as string || errorMessage;
                break;
            }
          }
          openCommunityModal({
            message: errorMessage,
            showCancel: false,
            onConfirm: closeCommunityModal,
          });
        }
      },
    });
  };

  const openReportModal = async () => {
    if (!user?.userNo) {
      openCommunityModal({ message: '로그인 후 신고 가능합니다.', onConfirm: closeCommunityModal, showCancel: false });
      return;
    }
    if (!sellData) return;

    const category = MARKETPLACE_CATEGORY;
    const targetInfo: ReportTargetInfo = {
      author: sellData.author,
      title: sellData.title,
      category: category,
      refNo: sellData.productId,
    };
    setReportTargetInfo(targetInfo);

    try {
      const res = await api.get<ReportOption[]>(`/community/report/types`);
      const filteredOptions = res.data.filter((option) => option.category === category);
      setReportOptions(filteredOptions);
      setIsReportModalOpen(true);
    } catch (err) {
      console.error('신고 옵션 로드 실패:', err);
      setReportOptions([]);
      openCommunityModal({ message: '신고 옵션 로드 실패', onConfirm: closeCommunityModal, showCancel: false });
    }
  };

  const handleReportSubmit = async (reportType: string, content: string, refNo: number, refType: string) => {
    if (!user?.userNo) {
      openCommunityModal({ message: '로그인 후 신고 가능합니다.', onConfirm: closeCommunityModal, showCancel: false });
      return;
    }
    try {
      await api.post(`/community/report`, {
        reportType,
        content,
        refNo,
        refType,
      });
      openCommunityModal({ message: '신고가 접수되었습니다.', onConfirm: closeCommunityModal, showCancel: false });
      setIsReportModalOpen(false);
      setReportTargetInfo(null);
    } catch (err: any) {
      console.error(err);
      openCommunityModal({ message: err.response?.data || '신고 실패', onConfirm: closeCommunityModal, showCancel: false });
      setIsReportModalOpen(false);
      setReportTargetInfo(null);
    }
  };

  if (loading) return <div className={styles.container}>데이터를 불러오는 중...</div>;
  if (error) return <div className={styles.errorBox}>{error}</div>;
  if (!formData || !sellData) {
    return <div className={styles.container}>구매 폼 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <>
      <CommunityHeader />
      <div className={styles.container}>
        <div className={styles.formContainer}>
          {/* 상단 게시글 정보 */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>구매한 상품 정보</h2>
            </div>
            <div className={styles.itemInfo}>
              <div className={styles.itemImageContainer}>
                <img src={sellData.imageUrl} alt={sellData.title} className={styles.itemImagePreview} />
              </div>
              <div className={styles.itemDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>상품명</span>
                  <input type="text" className={styles.detailInput} value={sellData.name} readOnly />
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>가격</span>
                  <input type="text" className={styles.detailInput} value={sellData.price.toLocaleString()} readOnly />
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>구매 수량</span>
                  <input type="text" className={styles.detailInput} value={formData.count} readOnly />
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>총 금액</span>
                  <input
                    type="text"
                    className={styles.detailInput}
                    value={(sellData.price * formData.count).toLocaleString()}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 배송지 정보 */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>배송 정보</h2>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>받는사람</span>
              <input type="text" className={styles.detailInput} value={formData.dlvrName} readOnly />
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>전화번호</span>
              <input type="text" className={styles.detailInput} value={formData.buyerPhone} readOnly />
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>주소</span>
              <input type="text" className={styles.detailInput} value={formData.address} readOnly />
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>상세주소</span>
              <input type="text" className={styles.detailInput} value={formData.detailAddress} readOnly />
            </div>
          </div>

          {/* 버튼 */}
          <div className={styles.buttonGroup}>
            <button type="button" className={styles.reportButton} onClick={openReportModal}>
              신고하기
            </button>
            <button type="button" className={styles.cancelButton} onClick={handleDeleteClick}>
              삭제
            </button>
            <button type="button" className={styles.submitButton} onClick={() => navigate(-1)}>
              목록으로
            </button>
          </div>
        </div>

        {/* 모달들 */}
        {communityModal && (
          <CommunityModal
            message={communityModal.message}
            onConfirm={handleCommunityModalConfirm}
            onClose={closeCommunityModal}
            showCancel={communityModal.showCancel}
          />
        )}
        {isReportModalOpen && reportTargetInfo && (
          <ReportModal
            isOpen={isReportModalOpen}
            onClose={() => {
              setIsReportModalOpen(false);
              setReportTargetInfo(null);
            }}
            onSubmit={handleReportSubmit}
            reportOptions={reportOptions}
            targetInfo={reportTargetInfo}
          />
        )}
      </div>
    </>
  );
}

export default MarketMyDetailPage;
