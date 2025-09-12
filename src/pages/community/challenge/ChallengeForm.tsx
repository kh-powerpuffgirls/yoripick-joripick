import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ChallengeForm.module.css';
import CommunityHeader from '../CommunityHeader';

interface ChallengePost {
  title?: string;
  postImageUrl?: string;
  videoUrl?: string;
  chInfoNo?: number;
  userNo?: number;
}

interface ChallengeDto {
  videoUrl: string;
  chInfoNo: number;
  userNo: number;
}

const ChallengeForm = () => {
  const { challengeNo } = useParams<{ challengeNo: string }>();
  const navigate = useNavigate();
  const isEdit = !!challengeNo;

  const [chInfoNo, setChInfoNo] = useState<number | null>(null);
  const [title, setTitle] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
  const [loginUserNo, setLoginUserNo] = useState<number | null>(null);
  const [postUserNo, setPostUserNo] = useState<number | null>(null);

  // 로그인한 유저 정보 가져오기
  useEffect(() => {
    const fetchLoginUser = async () => {
      try {
        const res = await axios.get<{ userNo: number }>(
          'http://localhost:8081/auth/loginUser',
          { withCredentials: true }
        );
        setLoginUserNo(res.data.userNo);
      } catch (err) {
        console.error('로그인 유저 정보 가져오기 실패', err);
        setLoginUserNo(null);
      }
    };
    fetchLoginUser();
  }, []);

  // 게시글 데이터 가져오기 (수정 모드)
  useEffect(() => {
    if (isEdit && challengeNo) {
      const fetchPostData = async () => {
        try {
          const response = await axios.get<ChallengePost>(
            `http://localhost:8081/community/challenge/${challengeNo}`,
            { withCredentials: true }
          );
          const post = response.data;
          setTitle(post.title || '');
          setVideoUrl(post.videoUrl || '');
          setChInfoNo(post.chInfoNo || null);
          setPostUserNo(post.userNo || null);
          if (post.postImageUrl) {
            setExistingImageUrl(post.postImageUrl);
            setPreviewImageUrl(`http://localhost:8081/images/${post.postImageUrl}`);
          }
        } catch (error) {
          console.error('게시글 데이터를 불러오는 데 실패했습니다.', error);
          alert('게시글을 불러오는 데 실패했습니다. 다시 시도해 주세요.');
          navigate('/community/challenge');
        }
      };
      fetchPostData();
    }
  }, [isEdit, challengeNo, navigate]);

  // 활성 챌린지 가져오기 (새 작성 모드)
  useEffect(() => {
    if (!isEdit) {
      const fetchActiveChallenge = async () => {
        try {
          const response = await axios.get<ChallengePost[]>(
            'http://localhost:8081/community/challenge/active',
            { withCredentials: true }
          );
          const activeList = response.data;
          if (activeList && activeList.length > 0) {
            const active = activeList[0];
            setTitle(active.title || '');
            setChInfoNo(active.chInfoNo || null);
            setVideoUrl(active.videoUrl || '');
            if (active.postImageUrl) {
              setExistingImageUrl(active.postImageUrl);
              setPreviewImageUrl(`http://localhost:8081/images/${active.postImageUrl}`);
            }
          } else {
            alert('활성 챌린지가 없습니다.');
            navigate('/community/challenge');
          }
        } catch (error) {
          console.error('활성 챌린지 데이터를 불러오는 데 실패했습니다.', error);
        }
      };
      fetchActiveChallenge();
    }
  }, [isEdit, navigate]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      setPreviewImageUrl(URL.createObjectURL(file));
    } else {
      setPreviewImageUrl(existingImageUrl ? `http://localhost:8081/images/${existingImageUrl}` : '');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!chInfoNo) return alert('챌린지 정보를 불러오는 중 오류가 발생했습니다.');
    if (!loginUserNo) return alert('로그인 후 이용할 수 있습니다.');

    const formData = new FormData();
    const challengeDto: ChallengeDto = { videoUrl, chInfoNo, userNo: loginUserNo };
    formData.append('challengeDto', new Blob([JSON.stringify(challengeDto)], { type: 'application/json' }));

    if (imageFile) formData.append('file', imageFile);

    try {
      if (isEdit) {
        if (loginUserNo !== postUserNo) return alert('작성자만 수정할 수 있습니다.');
        await axios.put(`http://localhost:8081/community/challenge/${challengeNo}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        navigate(`/community/challenge/${challengeNo}`);
      } else {
        const response = await axios.post('http://localhost:8081/community/challenge', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        const newChallengeNo = response.data?.challengeNo;
        if (!newChallengeNo) return alert('서버에서 챌린지 번호를 받지 못했습니다.');
        navigate(`/community/challenge/${newChallengeNo}`);
      }
    } catch (error) {
      console.error('게시글 처리 실패:', error);
      alert(`게시글 ${isEdit ? '수정' : '등록'}에 실패했습니다.`);
    }
  };

  const handleDelete = async () => {
    if (!challengeNo) return;
    if (loginUserNo !== postUserNo) return alert('작성자만 삭제할 수 있습니다.');
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`http://localhost:8081/community/challenge/${challengeNo}`, {
        withCredentials: true,
      });
      navigate('/community/challenge');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  return (
    <>
      <CommunityHeader />
      <div className={styles.container}>
        <h1>{isEdit ? '게시글 수정' : '새 게시글 작성'}</h1>
        <div className={styles.titleDisplay}>{title || '값 없음'}</div>

        <div className={styles.previewBox}>
          {previewImageUrl ? (
            <img src={previewImageUrl} alt="미리보기" className={styles.previewImage} />
          ) : (
            '미리보기'
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              이미지 업로드 {existingImageUrl ? '(선택 가능)' : '*'}
            </label>
            <div className={styles.fileInputBox}>
              <label htmlFor="image-upload" className={styles.fileButton}>
                이미지 선택
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleImageChange}
                required={!isEdit && !existingImageUrl}
              />
              <span className={styles.fileName}>
                {imageFile?.name || (existingImageUrl ? existingImageUrl.split('/').pop() : '선택된 이미지 없음')}
              </span>
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
            {(!isEdit || loginUserNo === postUserNo) && (
              <button type="submit" className={styles.submitButton}>
                {isEdit ? '수정' : '등록'}
              </button>
            )}
            <button type="button" className={styles.cancelButton} onClick={() => navigate('/community/challenge')}>
              취소
            </button>
            {isEdit && loginUserNo === postUserNo && (
              <button type="button" className={styles.deleteButton} onClick={handleDelete}>
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
