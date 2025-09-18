import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import styles from "./ChallengeForm.module.css";

// API 기본 URL 정의
const API_BASE = "http://localhost:8081";

// 이미지 URL 생성 헬퍼 함수
const getImageUrl = (serverName: string) =>
  `${API_BASE}/images/${serverName}`;

// 챌린지 정보 데이터 타입 정의
interface ChallengeInfo {
  chInfoNo: number;
  title: string;
  startDate?: string;
  endDate?: string;
  imageNo?: number;
}

// 챌린지 참여 게시글 데이터 타입 정의
interface Challenge {
  challengeNo: number;
  chInfoNo: number;
  userNo: number;
  videoUrl?: string;
  serverName?: string;
}

// 챌린지 참여 폼 컴포넌트
const ChallengeForm = () => {
  // URL 파라미터에서 챌린지 번호를 가져옴
  const { challengeNo } = useParams<{ challengeNo: string }>();
  // 챌린지 번호가 있으면 수정 모드, 없으면 작성 모드
  const isEdit = Boolean(challengeNo);
  // 페이지 이동 훅 사용
  const navigate = useNavigate();

  // Redux 스토어에서 사용자 번호 가져오기
  const userNo = useSelector((state: RootState) => state.auth.user?.userNo);

  // 컴포넌트 상태 관리
  const [title, setTitle] = useState("");
  const [chInfoNo, setChInfoNo] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit); // 수정 모드일 때 초기 로딩 필요
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 로그인 상태 확인
  useEffect(() => {
    if (!userNo) setError("로그인이 필요합니다.");
  }, [userNo]);

  // 수정 모드일 때 기존 데이터 불러오거나, 작성 모드일 때 현재 진행 중인 챌린지 정보 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (isEdit) {
          // 수정 모드: 챌린지 참여 게시글과 챌린지 정보 모두 가져옴
          const { data: challengeData } = await axios.get<Challenge>(
            `${API_BASE}/community/challenge/${challengeNo}`,
            { withCredentials: true }
          );
          const { data: infoData } = await axios.get<ChallengeInfo>(
            `${API_BASE}/community/challenge/active/${challengeData.chInfoNo}`
          );
          // 가져온 데이터로 상태 업데이트
          setTitle(infoData.title);
          setChInfoNo(infoData.chInfoNo);
          if (challengeData.videoUrl) setVideoUrl(challengeData.videoUrl);
          if (challengeData.serverName)
            setPreviewImage(getImageUrl(challengeData.serverName));
        } else {
          // 작성 모드: 현재 진행 중인 챌린지 정보 목록을 가져와서 첫 번째 챌린지를 선택
          const { data: infoList } = await axios.get<ChallengeInfo[]>(
            `${API_BASE}/community/challenge/active`
          );
          if (infoList.length > 0) {
            setTitle(infoList[0].title);
            setChInfoNo(infoList[0].chInfoNo);
          }
        }
      } catch (e) {
        setError("데이터 불러오기 실패");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [challengeNo, isEdit]); // challengeNo 또는 isEdit이 변경될 때마다 실행

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    // 선택된 파일이 있으면 미리보기 URL 생성
    setPreviewImage(file ? URL.createObjectURL(file) : null);
  };

  // 폼 제출 핸들러 (챌린지 등록/수정)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // 필수 조건 유효성 검사
    if (!userNo) return setError("로그인이 필요합니다.");
    if (!chInfoNo) return setError("챌린지 정보를 선택할 수 없습니다.");

    try {
      // 서버 전송을 위한 FormData 객체 생성
      const formData = new FormData();
      formData.append("userNo", String(userNo));
      formData.append("chInfoNo", String(chInfoNo));
      if (videoUrl.trim()) formData.append("videoUrl", videoUrl);
      if (selectedImage) formData.append("file", selectedImage);

      if (isEdit) {
        // 수정 모드: PUT 요청
        await axios.put(`${API_BASE}/community/challenge/${challengeNo}`, formData, { withCredentials: true });
        setMessage("챌린지 수정 완료");
      } else {
        // 작성 모드: POST 요청
        await axios.post(`${API_BASE}/community/challenge`, formData, { withCredentials: true });
        setMessage("챌린지 등록 완료");
      }

      // 성공 메시지 표시 후 페이지 이동
      setTimeout(() => navigate("/community/challenge"), 1500);
    } catch (e: any) {
      if (e.response?.status === 401) {
        setError("로그인이 필요합니다.");
        navigate("/login");
      } else {
        setError(isEdit ? "챌린지 수정 실패" : "챌린지 등록 실패");
      }
    }
  };

  // 로딩 상태일 때 화면 표시
  if (loading) return <div className={styles.loading}>로딩 중...</div>;

  // JSX 렌더링
  return (
    <div className={styles.container}>
      <h1>{isEdit ? "챌린지 수정" : "챌린지 등록"}</h1>

      {message && <div className={styles.messageBox}>{message}</div>}
      {error && <div className={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>챌린지 타이틀</label>
          {/* 챌린지 타이틀은 읽기 전용으로 표시 */}
          <input type="text" value={title} readOnly className={styles.titleDisplay} />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>영상 URL (선택)</label>
          <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className={styles.urlInput} />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>이미지 업로드</label>
          <div className={styles.fileInputBox}>
            <label className={styles.fileButton}>
              선택
              <input type="file" accept="image/*" onChange={handleImageChange} className={styles.hiddenInput} />
            </label>
            <span className={styles.fileName}>{selectedImage?.name || "선택된 파일 없음"}</span>
          </div>
        </div>

        {/* 이미지 미리보기 */}
        <div className={styles.previewBox}>
          {previewImage ? <img src={previewImage} alt="미리보기" className={styles.previewImage} /> : "이미지를 선택하세요"}
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>{isEdit ? "수정 완료" : "등록 완료"}</button>
          <button type="button" className={styles.cancelButton} onClick={() => navigate("/community/challenge")}>취소</button>
        </div>
      </form>
    </div>
  );
};

export default ChallengeForm;