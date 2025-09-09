import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ChallengeForm.module.css';
import CommunityHeader from '../CommunityHeader';

const ChallengeForm = () => {
    // useParams는 타입 매개변수를 받아서 자동으로 타입을 추론합니다.
    const { challengeNo } = useParams<{ challengeNo: string }>();
    const navigate = useNavigate();
    const isEdit = !!challengeNo;

    const [title, setTitle] = useState<string>('');
    const [existingImageUrl, setExistingImageUrl] = useState<string>(''); 
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string>(''); 

    // 수정 모드: 기존 데이터 불러오기
    useEffect(() => {
        if (isEdit) {
            const fetchPostData = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/community/challenge/${challengeNo}`);
                    const post = response.data;
                    setTitle(post.title || '');
                    setExistingImageUrl(post.imageUrl || '');
                    setVideoUrl(post.videoUrl || '');
                } catch (error) {
                    console.error("게시글 데이터를 불러오는 데 실패했습니다.", error);
                    alert("게시글을 불러오는 데 실패했습니다. 다시 시도해 주세요.");
                    navigate('/community/challenge');
                }
            };
            fetchPostData();
        }
    }, [isEdit, challengeNo, navigate]);

    // 작성 모드: 활성 챌린지 정보 불러오기
    useEffect(() => {
        if (!isEdit) {
            const fetchActiveChallenge = async () => {
                try {
                    const response = await axios.get('http://localhost:8080/community/challenge/active');
                    const active = response.data;
                    if (active) setTitle(active.title);
                } catch (error) {
                    console.error("챌린지 데이터를 불러오는 데 실패했습니다.", error);
                }
            };
            fetchActiveChallenge();
        }
    }, [isEdit]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        if (file) {
            setPreviewImageUrl(URL.createObjectURL(file));
        }
    };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEdit && !imageFile) {
        alert('이미지를 선택해주세요.');
        return;
    }

    const challengeDto = {
        videoUrl,
    };

    const formData = new FormData();
    formData.append('challengeDto', new Blob([JSON.stringify(challengeDto)], { type: 'application/json' }));

    if (imageFile) {
        formData.append('file', imageFile);
    }
    
    try {
        if (isEdit) {
            await axios.put(`http://localhost:8080/community/challenge/${challengeNo}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate(`/community/challenge/${challengeNo}`);
        } else {
            const response = await axios.post('http://localhost:8080/community/challenge', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const newChallengeNo = response.data.challengeNo;
            navigate(`/community/challenge/${newChallengeNo}`);
        }
    } catch (error) {
        console.error("게시글 처리 실패:", error);
        alert(`게시글 ${isEdit ? '수정' : '등록'}에 실패했습니다.`);
    }
};

    const handleDelete = async () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await axios.delete(`http://localhost:8080/community/challenge/${challengeNo}`);
                navigate('/community/challenge');
            } catch (error) {
                console.error("게시글 삭제 실패:", error);
                alert('게시글 삭제에 실패했습니다.');
            }
        }
    };

    const displayImageUrl = previewImageUrl || (isEdit && existingImageUrl ? `http://localhost:8080/images/${existingImageUrl}` : '');
    const displayedFileName = imageFile?.name || (isEdit && existingImageUrl ? existingImageUrl.split('/').pop() : '선택된 이미지 없음');

    return (
        <>
            <CommunityHeader />
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>{isEdit ? '게시글 수정' : '새 게시글 작성'}</h1>
                <div className={styles.titleDisplay}>{title || '값 없음'}</div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>이미지 업로드 {existingImageUrl ? '(선택 가능)' : '*'}</label>
                        <div className={styles.fileInputBox}>
                            <label htmlFor="image-upload" className={styles.fileButton}>이미지 선택</label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className={styles.hiddenInput}
                                onChange={handleImageChange}
                                required={!isEdit}
                            />
                            <span className={styles.fileName}>{displayedFileName}</span>
                        </div>
                        <div className={styles.previewBox}>
                            {displayImageUrl ? <img src={displayImageUrl} alt="미리보기" className={styles.previewImage} /> : '미리보기'}
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>챌린지 URL</label>
                        <input
                            type="text"
                            className={styles.urlInput}
                            placeholder="URL을 등록해주세요."
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.submitButton}>{isEdit ? '수정' : '등록'}</button>
                        <button type="button" className={styles.cancelButton} onClick={() => navigate('/community/challenge')}>취소</button>
                        {isEdit && <button type="button" className={styles.deleteButton} onClick={handleDelete}>삭제</button>}
                    </div>
                </form>
            </div>
        </>
    );
};

export default ChallengeForm;