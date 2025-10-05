import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { store } from '../../../store/store';
import styles from './MarketForm.module.css';
import CommunityHeader from '../Header/CommunityHeader';
import SellerModal from './SellerModal';
import CommunityModal from '../CommunityModal';

const getAccessToken = () => store.getState().auth.accessToken;

const API_BASE = 'https://api.ypjp.store:8443';
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (err: AxiosError) => {
    if (err.response?.status === 401) {
      console.error('401 Unauthorized - 로그인 필요');
    }
    return Promise.reject(err);
  }
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

const MarketForm = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const userNo = user?.userNo;
  const isLoggedIn = Boolean(userNo);

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
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkAuthAndRedirect = setTimeout(() => {
      if (!user) {
        setError('게시글 등록을 위해 로그인해야 합니다.');
        navigate('/login');
      }
    }, 100);
    return () => clearTimeout(checkAuthAndRedirect);
  }, [user, navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
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

    if (!imageFile) {
      setError('상품 이미지를 반드시 첨부해야 합니다.');
      return;
    }

    if (!isLoggedIn || !userNo) {
      setError('로그인 후 이용 가능합니다.');
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

  const handleConfirmSubmit = async () => {
    try {
      const data = new FormData();
      const deadlineValue = formData.alwaysOnSale ? '2999-12-31' : formData.deadline;

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

      data.append('marketDto', new Blob([JSON.stringify(marketDto)], { type: 'application/json' }));
      if (imageFile) data.append('image', imageFile);

      await api.post('/community/market', data, { headers: { 'Content-Type': 'multipart/form-data' } });

      setMessage('판매 글이 성공적으로 등록되었습니다.');
      setShowModal(false);
      setTimeout(() => navigate('/community/market'), 1500);
    } catch (err) {
      console.error('판매 글 등록 실패:', err);
      setError('판매 글 등록에 실패했습니다.');
      setShowModal(false);
    }
  };

  const handleCancel = () => {
    navigate('/community/market');
  };

  return (
    <>
      <CommunityHeader />
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            {/* 제목 및 작성자 */}
            <div className={styles.formHeader}>
              <input
                type="text"
                placeholder="폼 제목을 입력해주세요."
                className={styles.titleInput}
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              <div className={styles.authorInfo}>
                <span>{user?.username || '로그인된 사용자'}</span>
                <span className={styles.date}>{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {message && <div className={styles.messageBox}>{message}</div>}
            {error && <div className={styles.errorBox}>{error}</div>}

            {/* 이미지 업로드 */}
            <div className={styles.imageUploadSection}>
              <div className={styles.imageBox}>
                {imagePreview ? (
                  <img src={imagePreview} alt="상품 이미지" className={styles.imagePreview} />
                ) : (
                  <span>상품 이미지</span>
                )}
              </div>
              <div className={styles.uploadText}>
                운영정책에 어긋나는 이미지 등록 시 이용이 제한될 수 있습니다.
              </div>
              <label htmlFor="image-upload" className={styles.imageUploadBtn}>이미지 선택 (필수)</label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.hiddenInput}
              />
              <span className={styles.noFileText}>{fileName}</span>
              {imagePreview && (
                <button type="button" onClick={handleClearImage} className={styles.clearButton}>
                  이미지 삭제
                </button>
              )}
            </div>

            {/* 판매 기간 */}
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
                    disabled={formData.alwaysOnSale}
                    required={!formData.alwaysOnSale}
                  />
                </div>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="alwaysOnSale"
                    checked={formData.alwaysOnSale}
                    onChange={handleInputChange}
                  />
                  <span>상시 판매</span>
                </label>
              </div>
            </div>

            {/* 상세 설명 */}
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
              ></textarea>
            </div>

            {/* 상품 정보 */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>상품 정보 입력</span>
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemImagePlaceholder}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="상품 이미지 미리보기" className={styles.itemImagePreview} />
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
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 문의전화 */}
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
              />
            </div>

            {/* 계좌번호 */}
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
              />
            </div>

            {/* 버튼 그룹 */}
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.submitButton}>등록</button>
              <button type="button" className={styles.cancelButton} onClick={handleCancel}>취소</button>
            </div>
          </form>
        </div>
      </div>

      {/* 등록 전 확인 모달 */}
      <SellerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmSubmit}
      />

      {/* 등록 성공/실패 모달 */}
      {(message || error) && (
        <CommunityModal
          message={message || error || ''}
          onClose={() => { setMessage(null); setError(null); }}
          onConfirm={() => { setMessage(null); setError(null); }}
          showCancel={true}
        />
      )}
    </>
  );
};

export default MarketForm;