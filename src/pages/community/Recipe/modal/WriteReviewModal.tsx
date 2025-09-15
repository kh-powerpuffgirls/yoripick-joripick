import React, { useState} from 'react';
import { api } from '../../../../api/authApi';
import styles from './DetailModal.module.css'; // ✨ CSS 모듈 파일명 확인
import type { WriteReviewModalProps } from '../../../../type/Recipe';

// 아이콘 및 이미지 import
import closeIcon from '../../../../assets/sample/X_btn.png';
import sampleProfileImg from '../../../../assets/sample/profile.png';

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({ rcpNo, onClose, onReviewSubmit }) => {
  const [stars, setStars] = useState(0);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleRating = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStars(Number(e.target.value) / 2);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (stars === 0) return alert('별점을 선택해주세요.');
    if (!content.trim()) return alert('한줄 리뷰를 입력해주세요.');

    const formData = new FormData();
    formData.append('rcpNo', String(rcpNo));
    formData.append('stars', String(stars));
    formData.append('content', content);
    if (imageFile) formData.append('image', imageFile);

    try {
      await api.post('/api/reviews', formData, { 
        headers: {'Content-Type': 'multipart/form-data'} 
      });
      alert('리뷰가 성공적으로 등록되었습니다.');
      onReviewSubmit();
    } catch (error) {
      console.error("리뷰 등록 실패:", error);
      alert('리뷰 등록에 실패했습니다.');
    }
  };

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_writereview}>
        <div className={styles.head_title}>
            <span>리뷰작성</span>
            <img src={closeIcon} id={styles.close} onClick={onClose} alt="닫기" />
        </div>
        <div className={styles.continer}>
            <div className={styles.profile_stars}>
                <img src={sampleProfileImg} width="70px" alt="프로필"/>
                <fieldset className={styles.rate}>
                    <input type="radio" id="rating10" name="rating" value="10" onChange={handleRating} /><label htmlFor="rating10" title="5점"></label>
                    <input type="radio" id="rating9" name="rating" value="9" onChange={handleRating} /><label className={styles.half} htmlFor="rating9" title="4.5점"></label>
                    {/* ... 나머지 input 태그들 ... */}
                    <input type="radio" id="rating2" name="rating" value="2" onChange={handleRating} /><label htmlFor="rating2" title="1점"></label>
                    <input type="radio" id="rating1" name="rating" value="1" onChange={handleRating} /><label className={styles.half} htmlFor="rating1" title="0.5점"></label>
                </fieldset>
            </div>
            <div className={styles.content}>
                <span>한줄리뷰</span>
                <input type="text" name="content" placeholder="80자 내외" value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div className={styles.content}>
                <span>만든 요리 첨부</span>
                <label htmlFor="fileInput" className={styles.upload_box}>
                    {preview ? <img src={preview} alt="미리보기" /> : '+'}
                </label>
                <input type="file" id="fileInput" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                <div className={styles.file_name}>{imageFile?.name}</div>
            </div>
            <div className={styles.btn}>
                <button id={styles.cancel} onClick={onClose}>작성 취소</button>
                <button id={styles.complete} onClick={handleSubmit}>작성 완료</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewModal;