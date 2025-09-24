import React, { useState } from 'react';
import { api } from '../../../../api/authApi';
import styles from './DetailModal.module.css';
import type { WriteReviewModalProps } from '../../../../type/Recipe';
import type { RootState } from '../../../../store/store';

import closeIcon from '../../../../assets/sample/X_btn.png';
import sampleProfileImg from '../../../../assets/sample/profile.png';
import { useSelector } from 'react-redux';

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({ rcpNo, onClose, onReviewSubmit }) => {
  const [stars, setStars] = useState(0);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const userProfile = useSelector((state: RootState) => state.auth.user?.profile);
  const userNo = useSelector((state: RootState) => state.auth.user?.userNo);

  // 유저 프로필
  const profileImageUrl = userProfile 
    ? userProfile
    : sampleProfileImg;

  // 별점 클릭 시 state 변경 (0.5점 단위 처리를 위해 value를 2로 나눔)
  const handleRating = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStars(Number(e.target.value) / 2);
  };
  
  // 이미지 선택 시 미리보기 기능
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      if (preview) {
        URL.revokeObjectURL(preview); // 기존 미리보기 URL 해제
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  // '작성 완료' 버튼 클릭 시
  const handleSubmit = async () => {
    if (stars === 0) {
      alert('별점을 선택해주세요.');
      return; 
    }
    if (!content.trim()) {
      alert('한줄 리뷰를 입력해주세요.');
      return;
    }
    const formData = new FormData();
    formData.append('rcpNo', String(rcpNo));
    formData.append('stars', String(stars));
    formData.append('content', content);
    if (imageFile) formData.append('image', imageFile);
    
    try {
      if (!userNo) {
          alert('로그인이 필요합니다.');
          return;
      }

      await api.post(
        `/api/community/recipe/${rcpNo}/reviews/${userNo}`, 
        formData, 
        { 
          headers: {'Content-Type': 'multipart/form-data'} 
        }
      );

      alert('리뷰가 성공적으로 등록되었습니다.');
      onReviewSubmit(); // 부모에게 완료 사실을 알려 리뷰 목록 새로고침
      onClose();
      
    } catch (error) {
      console.error("리뷰 등록 실패:", error);
      alert('리뷰 등록에 실패했습니다.');
    }
  };

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div className={styles.modal_writereview} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head_title}>
            <span>리뷰작성</span>
            <img src={closeIcon} id={styles.close} onClick={onClose} alt="닫기" />
        </div>
        <div className={styles.continer}>
            <div className={styles.profile_stars}>
                <img src={profileImageUrl} width="70px" alt="프로필"/>
                <fieldset className={styles.rate}>
                    <input type="radio" id="rating10" name="rating" value="10" onChange={handleRating} /><label htmlFor="rating10" title="5점"></label>
                    <input type="radio" id="rating9" name="rating" value="9" onChange={handleRating} /><label className={styles.half} htmlFor="rating9" title="4.5점"></label>
                    <input type="radio" id="rating8" name="rating" value="8" onChange={handleRating} /><label htmlFor="rating8" title="4점"></label>
                    <input type="radio" id="rating7" name="rating" value="7" onChange={handleRating} /><label className={styles.half} htmlFor="rating7" title="3.5점"></label>
                    <input type="radio" id="rating6" name="rating" value="6" onChange={handleRating} /><label htmlFor="rating6" title="3점"></label>
                    <input type="radio" id="rating5" name="rating" value="5" onChange={handleRating} /><label className={styles.half} htmlFor="rating5" title="2.5점"></label>
                    <input type="radio" id="rating4" name="rating" value="4" onChange={handleRating} /><label htmlFor="rating4" title="2점"></label>
                    <input type="radio" id="rating3" name="rating" value="3" onChange={handleRating} /><label className={styles.half} htmlFor="rating3" title="1.5점"></label>
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