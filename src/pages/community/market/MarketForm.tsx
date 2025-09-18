// MarketForm.tsx
import React, { useState } from 'react';
import styles from './MarketForm.module.css';
import CommunityHeader from '../CommunityHeader';
import { useNavigate } from 'react-router-dom';

const MarketForm = () => {
    const navigate = useNavigate();
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 등록 로직 구현 (API 호출 등)
        alert('판매 글이 등록되었습니다.');
        navigate('/community/market');
    };

    const handleCancel = () => {
        navigate('/community/market');
    };

    return (
        <>
            <CommunityHeader/>
            <div className={styles.container}>
                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formHeader}>
                            <input
                                type="text"
                                placeholder="폼 제목을 입력해주세요."
                                className={styles.titleInput}
                            />
                            <div className={styles.authorInfo}>
                                <div className={styles.profileIcon}></div>
                                <span>망곰eee</span>
                                <span className={styles.date}>2025.08.28</span>
                            </div>
                        </div>

                        <div className={styles.imageUploadSection}>
                            <div className={styles.imageBox}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="상품 이미지" className={styles.imagePreview} />
                                ) : (
                                    <span>이미지</span>
                                )}
                            </div>
                            <div className={styles.uploadText}>
                                운영정책에 어긋나는 이미지 등록 시 이용이 제한될 수 있습니다.
                            </div>
                            <label htmlFor="image-upload" className={styles.imageUploadBtn}>
                                이미지 선택
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className={styles.hiddenInput}
                            />
                            <span className={styles.noFileText}>선택된 이미지 없음</span>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionTitle}>판매 기간</span>
                            </div>
                            <div className={styles.dateInputs}>
                                <div className={styles.dateInputWrapper}>
                                    <span className={styles.inputLabel}>폼 시작일</span>
                                    <input type="date" className={styles.dateInput} />
                                </div>
                                <div className={styles.dateInputWrapper}>
                                    <span className={styles.inputLabel}>폼 종료일</span>
                                    <input type="date" className={styles.dateInput} />
                                </div>
                                <label className={styles.checkboxLabel}>
                                    <input type="checkbox" />
                                    <span>상시 판매</span>
                                </label>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionTitle}>상세 설명</span>
                            </div>
                            <textarea
                                placeholder="상세 설명을 입력해주세요."
                                className={styles.descriptionTextarea}
                            ></textarea>
                        </div>
                        
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionTitle}>상품 정보 입력</span>
                            </div>
                            <div className={styles.itemInfo}>
                                <div className={styles.itemImagePlaceholder}></div>
                                <div className={styles.itemDetails}>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>상품명</span>
                                        <input type="text" placeholder="상품명을 입력해주세요." className={styles.detailInput} />
                                        <span className={styles.charCount}>(0/20)</span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>가격</span>
                                        <input type="text" placeholder="가격을 입력해주세요." className={styles.detailInput} />
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>재고</span>
                                        <input type="text" placeholder="최대 10,000개" className={styles.detailInput} />
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
                            />
                        </div>

                        <div className={styles.buttonGroup}>
                            <button type="submit" className={styles.submitButton}>등록</button>
                            <button type="button" className={styles.cancelButton} onClick={handleCancel}>취소</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default MarketForm;