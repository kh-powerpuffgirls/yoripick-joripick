import {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { store } from '../../../store/store';
import styles from './MarketForm.module.css';
import CommunityHeader from '../Header/CommunityHeader';
import SellerModal from './SellerModal';
import CommunityModal from '../CommunityModal';

const API_BASE = 'https://api.ypjp.store:8443';

const getAccessToken = () => store.getState().auth.accessToken;

const api = axios.create({
  baseURL: API_BASE,
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

api.interceptors.response.use(
  (response) => response,
  async (err: AxiosError) => Promise.reject(err),
);

interface MarketFormState {
  title: string;
  name: string;
  price: string;
  quantity: string;
  phone: string;
  accountNo: string;
  detail: string;
  deadline: string;
  alwaysOnSale: boolean;
}

const MarketEditForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const productId = id ? Number(id) : null;

  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = Boolean(user?.userNo);
  const userNo = user?.userNo;
  
  const [isAuthor, setIsAuthor] = useState(false);
  const [hasPurchaseRequests, setHasPurchaseRequests] = useState(false);

  const [formData, setFormData] = useState<MarketFormState>({
    title: '',
    name: '',
    price: '',
    quantity: '',
    phone: '',
    accountNo: '',
    detail: '',
    deadline: '',
    alwaysOnSale: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('선택된 이미지 없음');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); 
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPostData = async () => {
    if (!productId) {
      setError('수정할 게시글 ID가 유효하지 않습니다.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get(`/community/market/${productId}`);
      const item = response.data;
      
      const isCurrentUserAuthor = item.userNo === userNo;
      setIsAuthor(isCurrentUserAuthor);
      
      setHasPurchaseRequests(item.isPurchased); 

      const isAlwaysOnSale = item.deadline && item.deadline.startsWith('2999-12-31');

      setFormData({
        title: item.title || '',
        name: item.name || '',
        price: String(item.price || ''),
        quantity: String(item.quantity || ''),
        phone: item.phone || '',
        accountNo: item.accountNo || '',
        detail: item.detail || '',
        deadline: isAlwaysOnSale ? '' : item.deadline.split('T')[0] || '',
        alwaysOnSale: isAlwaysOnSale,
      });

      if (item.serverName) {
        const fullImageUrl = `${API_BASE}/images/market/${item.userNo}/${item.serverName.split('/').pop()}`;
        setImagePreview(fullImageUrl);
        setFileName(item.originName || '기존 이미지');
      }
    } catch (err) {
      console.error('게시글 불러오기 실패:', err);
      if (axios.isAxiosError(err) && err.response?.status === 404) {
         setError('게시글을 찾을 수 없습니다.');
      } else {
        setError('게시글 정보를 불러오는 데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchPostData();
    } else {
      setError('수정할 게시글 ID가 없습니다.');
      setIsLoading(false);
    }
  }, [productId, userNo]);


  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setFileName(file ? file.name : '선택된 이미지 없음');
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleClearImage = () => {
    setImageFile(null);
    setFileName('선택된 이미지 없음');
    setImagePreview(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSuccessMessage(null);

    if (!isLoggedIn || !userNo) {
      setError('로그인이 필요합니다. 로그인 후 다시 시도해 주세요.');
      return;
    }

    if (!isAuthor) {
      setError('게시글 수정 권한이 없습니다. 작성자만 수정할 수 있습니다.');
      return;
    }
    
    if (!imagePreview && !imageFile) {
      setError('상품 이미지를 반드시 첨부해야 합니다.');
      return;
    }

    if (
      !formData.title.trim() ||
      !formData.name.trim() ||
      !formData.price.trim() ||
      !formData.quantity.trim() ||
      !formData.phone.trim() ||
      !formData.accountNo.trim() ||
      !formData.detail.trim() ||
      (!formData.alwaysOnSale && !formData.deadline.trim())
    ) {
      setError('모든 필수 정보를 입력해주세요.');
      return;
    }

    setShowModal(true);
  };

  const handleSuccessModalClose = () => {
    setSuccessMessage(null);
    navigate(`/community/market/buyForm/${productId}`);
  }

  const handleConfirmSubmit = async () => {
    try {
      setShowModal(false);
      
      if (!productId || !userNo || !isAuthor) { 
        setError('수정 권한이 없거나 게시글 정보가 유효하지 않아 요청을 보낼 수 없습니다.');
        return;
      }

      const data = new FormData();
      const deadlineValue = formData.alwaysOnSale
        ? '2999-12-31'
        : formData.deadline;

      const marketDto = {
        title: formData.title,
        name: formData.name,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        phone: formData.phone,
        accountNo: formData.accountNo,
        detail: formData.detail,
        deadline: deadlineValue,
        alwaysOnSale: formData.alwaysOnSale,
        userNo: userNo,
      };

      data.append(
        'marketDto',
        new Blob([JSON.stringify(marketDto)], { type: 'application/json' }),
      );

      if (imageFile) {
        data.append('image', imageFile);
      }

      await api.put(`/community/market/${productId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccessMessage('판매 글이 성공적으로 수정되었습니다.');

    } catch (err) {
      console.error('Failed to update post:', err);
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setError('게시글 수정 권한이 없거나 처리할 수 없는 요청입니다.');
      } else if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
      } else {
        setError('판매 글 수정에 실패했습니다.');
      }
    }
  };

  const handleCancel = () => {
    navigate(`/community/market/buyForm/${productId}`);
  };

  if (isLoading) {
    return (
      <>
        <CommunityHeader />
        <div className={styles.container}>
          <div className={styles.formContainer}>
            <div className={styles.messageBox}>
                {error || '게시글 정보를 불러오는 중입니다...'}
            </div>
            {error && ( 
              <div className={styles.buttonGroup}>
                <button type="button" className={styles.cancelButton} onClick={handleCancel}>
                  뒤로가기
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  const isFatalError = error && (error.includes('게시글 ID') || error.includes('게시글을 찾을 수'));
  if (isFatalError) {
      return (
          <>
             <CommunityHeader />
             <div className={styles.container}>
                 <div className={styles.formContainer}>
                     <div className={styles.messageBox}>{error}</div>
                     <div className={styles.buttonGroup}>
                         <button type="button" className={styles.cancelButton} onClick={handleCancel}>
                             뒤로가기
                         </button>
                     </div>
                 </div>
             </div>
             {error && (
                 <CommunityModal
                     message={error}
                     onClose={() => setError(null)}
                     onConfirm={() => setError(null)}
                     showCancel={false}
                 />
             )}
         </>
      );
  }


  return (
    <>
      <CommunityHeader />
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <input
                type="text"
                placeholder="폼 제목을 입력해주세요."
                className={styles.titleInput}
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                disabled={!isAuthor} 
              />
              <div className={styles.authorInfo}>
                <span>{user?.username || '비로그인 사용자'}</span>
                <span className={styles.date}>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            {message && <div className={styles.messageBox}>{message}</div>}
            
            {error && <div className={styles.messageBox}>{error}</div>}
            
            <div className={styles.imageUploadSection}>
              <div className={styles.imageBox}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="상품 이미지"
                    className={styles.imagePreview}
                  />
                ) : (
                  <span>상품 이미지</span>
                )}
              </div>
              <div className={styles.uploadText}>
                운영정책에 어긋나는 이미지 등록 시 이용이 제한될 수 있습니다.
              </div>
              <label 
                htmlFor="image-upload" 
                className={styles.imageUploadBtn}
                style={!isAuthor ? { pointerEvents: 'none', opacity: 0.5 } : {}}
              >
                이미지 선택 (필수)
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.hiddenInput}
                disabled={!isAuthor} 
              />
              <span className={styles.noFileText}>{fileName}</span>
              {imagePreview && isAuthor && ( 
                <button
                  type="button"
                  onClick={handleClearImage}
                  className={styles.clearButton}
                >
                  이미지 삭제
                </button>
              )}
            </div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>판매 기간</span>
              </div>
              <div className={styles.dateInputs}>
                <div className={styles.dateInputWrapper}>
                  <span className={styles.inputLabel}>폼 시작일</span>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={new Date().toISOString().split('T')[0]}
                    disabled
                  />
                </div>
                <div className={styles.dateInputWrapper}>
                  <span className={styles.inputLabel}>폼 종료일</span>
                  <input
                    type="date"
                    className={styles.dateInput}
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    disabled={formData.alwaysOnSale || !isAuthor}
                    required={!formData.alwaysOnSale}
                  />
                </div>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="alwaysOnSale"
                    checked={formData.alwaysOnSale}
                    onChange={handleInputChange}
                    disabled={!isAuthor}
                  />
                  <span>상시 판매</span>
                </label>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>상세 설명</span>
              </div>
              <textarea
                placeholder="상세 설명을 입력해주세요. (최대 300자)"
                className={styles.descriptionTextarea}
                name="detail"
                value={formData.detail}
                onChange={handleInputChange}
                required
                disabled={!isAuthor}
              ></textarea>
            </div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>상품 정보 입력</span>
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemImagePlaceholder}>
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="상품 이미지 미리보기"
                      className={styles.itemImagePreview}
                    />
                  ) : (
                    <span>이미지</span>
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>상품명</span>
                    <input
                      type="text"
                      placeholder="상품명을 입력해주세요."
                      className={styles.detailInput}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      maxLength={20}
                      required
                      disabled={!isAuthor}
                    />
                    <span className={styles.charCount}>({formData.name.length}/20)</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>가격</span>
                    <input
                      type="number"
                      placeholder="가격을 입력해주세요."
                      className={styles.detailInput}
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="100"
                      disabled={!isAuthor}
                    />
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>재고</span>
                    <input
                      type="number"
                      placeholder="재고를 입력해주세요."
                      className={styles.detailInput}
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      disabled={!isAuthor}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>문의전화 (판매자)</span>
              </div>
              <input
                type="text"
                placeholder="상대방과 연락가능한 전화번호를 입력해주세요."
                className={styles.inputField}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                disabled={!isAuthor}
              />
            </div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>계좌번호 (판매자)</span>
              </div>
              <input
                type="text"
                placeholder="입금 받으실 계좌를 입력해주세요."
                className={styles.inputField}
                name="accountNo"
                value={formData.accountNo}
                onChange={handleInputChange}
                required
                disabled={!isAuthor}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!isAuthor}
              >
                수정 완료
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {error && (
        <CommunityModal
          message={error}
          onClose={() => setError(null)}
          onConfirm={() => setError(null)}
          showCancel={false}
        />
      )}
      
      {successMessage && (
        <CommunityModal
          message={successMessage}
          onClose={handleSuccessModalClose} 
          onConfirm={handleSuccessModalClose} 
          showCancel={false}
        />
      )}

      <SellerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmSubmit}
      />
    </>
  );
};

export default MarketEditForm;