import React, { useState, useEffect } from 'react';
import styles from './ChallengeForm.module.css';
import CommunityHeader from '../CommunityHeader';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface ChallengeFormProps {
    isEdit?: boolean;
    postId?: string;
}

const ChallengeForm = ({ isEdit = false, postId }: ChallengeFormProps) => {
    const [title, setTitle] = useState<string>('');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [chInfoNo, setChInfoNo] = useState<number | null>(null); // ⭐ 추가: 챌린지 정보 ID 상태
    const navigate = useNavigate();

    // 수정 모드일 경우 기존 게시글 데이터 로드 및 챌린지 ID 로드
    useEffect(() => {
        // ⭐ 수정: 챌린지 정보 ID를 먼저 가져옵니다.
        const fetchChallengeInfo = async () => {
            try {
                const response = await axios.get('http://localhost:8080/community/challenge/active');
                if (response.data && response.data.chInfoNo) {
                    setChInfoNo(response.data.chInfoNo);
                    // 챌린지 제목을 여기에 설정하여 표시
                    setTitle(response.data.title);
                }
            } catch (error) {
                console.error("액티브 챌린지를 불러오는 데 실패했습니다.", error);
            }
        };

        fetchChallengeInfo();

        if (isEdit && postId) {
            const fetchPost = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/community/challenge/${postId}`);
                    const post = response.data;
                    setImageUrl(post.imageUrl);
                    setVideoUrl(post.videoUrl);
                } catch (error) {
                    console.error("게시글을 불러오는 데 실패했습니다.", error);
                    alert("게시글을 불러오는 데 실패했습니다.");
                }
            };
            fetchPost();
        }
    }, [isEdit, postId]);

    // 이미지 파일 선택 핸들러
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
        }
    };

    // 이미지 서버 업로드 함수
    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post(
                'http://localhost:8080/community/challenge/images/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data.fileName;
        } catch (error) {
            console.error("이미지 업로드 실패:", error);
            alert("이미지 업로드에 실패했습니다.");
            return null;
        }
    };

    // 폼 제출 핸들러 (등록/수정)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 챌린지 ID가 없으면 오류 처리
        if (!chInfoNo) {
            alert('현재 진행 중인 챌린지가 없습니다.');
            return;
        }
        
        // 이미지 필수 여부 확인
        if (!isEdit && !imageFile) {
            alert('이미지를 선택해주세요.');
            return;
        }

        let serverImageUrl = '';
        if (imageFile) {
            const fileName = await uploadImage(imageFile);
            if (!fileName) return;
            serverImageUrl = `/images/upload/${fileName}`;
        } else if (isEdit) {
            serverImageUrl = imageUrl;
        }

        // ⭐ 수정: chInfoNo를 postData에 추가
        const postData = {
            chInfoNo: chInfoNo,
            postImageUrl: serverImageUrl,
            videoUrl: videoUrl
        };
        
        try {
            if (isEdit) {
                await axios.put(`http://localhost:8080/community/challenge/${postId}`, postData);
                alert('게시글이 성공적으로 수정되었습니다.');
            } else {
                await axios.post('http://localhost:8080/community/challenge', postData);
                alert('게시글이 성공적으로 등록되었습니다.');
            }
            navigate('/community/challenge');
        } catch (error) {
            console.error("게시글 처리 실패:", error);
            alert(`게시글 ${isEdit ? '수정' : '등록'}에 실패했습니다.`);
        }
    };

    // 삭제 핸들러
    const handleDelete = async () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await axios.delete(`http://localhost:8080/community/challenge/${postId}`);
                alert('게시글이 성공적으로 삭제되었습니다.');
                navigate('/community/challenge');
            } catch (error) {
                console.error("게시글 삭제 실패:", error);
                alert("게시글 삭제에 실패했습니다.");
            }
        }
    };

    return (
        <>
            <CommunityHeader />
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>참여하는 푸드 챌린지</h1>
                <div className={styles.titleDisplay}>{title || '마라탕에 팅후루 넣어먹기 챌린지 !!!'}</div>

                <div className={styles.previewBox}>
                    {imageUrl ? (
                        <img src={imageUrl} alt="미리보기 이미지" className={styles.previewImage} />
                    ) : (
                        '미리보기'
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>이미지 업로드 *</label>
                        <div className={styles.fileInputBox}>
                            <label htmlFor="image-upload" className={styles.fileButton}>이미지 선택</label>
                            <input
                                id="image-upload"
                                type="file"
                                className={styles.hiddenInput}
                                onChange={handleImageChange}
                                required={!isEdit}
                            />
                            <span className={styles.fileName}>{imageFile?.name || '선택된 이미지 없음'}</span>
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
                        <button type="submit" className={styles.submitButton}>
                            {isEdit ? '수정' : '등록'}
                        </button>
                        <button type="button" className={styles.cancelButton} onClick={() => navigate('/community/challenge')}>취소</button>
                        {isEdit && (
                            <button
                                type="button"
                                className={styles.deleteButton}
                                onClick={handleDelete}
                            >
                                삭제
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
};

export default ChallengeForm;