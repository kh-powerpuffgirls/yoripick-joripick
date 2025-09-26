import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { store } from "../../../store/store";
import type { RootState } from "../../../store/store";
import styles from "./ChallengeForm.module.css";
import CommunityHeader from "../Header/CommunityHeader";

// API 기본 URL
const API_BASE = "http://localhost:8081";

// store에서 accessToken 가져오기
const getAccessToken = () => store.getState().auth.accessToken;

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// 토큰 토큰 토큰 토큰 토큰
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// 이미지 URL 생성 함수
const getImageUrl = (serverName: string) =>
  `${API_BASE}/images/${serverName}`;

// 챌린지 정보 타입
interface ChallengeInfo {
  chInfoNo: number;
  title: string;
  startDate?: string;
  endDate?: string;
  imageNo?: number;
}

// 챌린지 참여 게시글 타입
interface Challenge {
  challengeNo: number;
  chInfoNo: number;
  userNo: number;
  videoUrl?: string;
  serverName?: string;
  title: string;
}

// 챌린지 폼 컴포넌트
const ChallengeForm = () => {
  const { challengeNo } = useParams<{ challengeNo: string }>();
  const isEdit = Boolean(challengeNo);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const userNo = useSelector((state: RootState) => state.auth.user?.userNo);

  // 상태 관리
  const [title, setTitle] = useState("");
  const [chInfoNo, setChInfoNo] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [originalServerName, setOriginalServerName] = useState<string | null>(null);

  useEffect(() => {

    const fetchData = async () => {
      try {
        setLoading(true);
        if (isEdit) {
          const { data: challengeData } = await api.get<Challenge>(
            `/community/challenge/${challengeNo}`,
          );
          setTitle(challengeData.title);
          setChInfoNo(challengeData.chInfoNo);
          if (challengeData.videoUrl) setVideoUrl(challengeData.videoUrl);
          if (challengeData.serverName) {
            setPreviewImage(getImageUrl(challengeData.serverName));
            setOriginalServerName(challengeData.serverName);
          }
        } else {
          const { data: infoList } = await api.get<ChallengeInfo[]>(
            "/community/challenge/active",
          );
          if (infoList.length > 0) {
            setTitle(infoList[0].title);
            setChInfoNo(infoList[0].chInfoNo);
          }
        }
      } catch (e: any) {
        if (e.response?.status === 401) {
          setError("로그인 세션이 만료되었습니다.");
        } else {
          setError("데이터 불러오기 실패");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [challengeNo, isEdit, user]);

    useEffect(() => {
  }, [userNo]);

  // 이미지 파일 선택
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    setPreviewImage(file ? URL.createObjectURL(file) : null);
    if (file) {
      setOriginalServerName(null);
    }
  };

  // 이미지 삭제
  const handleClearImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setOriginalServerName(null);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // 폼 제출
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!user) return setError("로그인이 필요합니다.");
    if (!chInfoNo) return setError("챌린지 정보를 선택할 수 없습니다.");

    try {
      const formData = new FormData();
      formData.append("chInfoNo", String(chInfoNo));
      if (title.trim()) formData.append("title", title);
      if (videoUrl.trim()) formData.append("videoUrl", videoUrl);
      if (selectedImage) {
        formData.append("file", selectedImage);
      } else if (isEdit && originalServerName) {
        formData.append("originalServerName", originalServerName);
      }

      if (isEdit) {
        await api.put(`/community/challenge/${challengeNo}`, formData);
        setMessage("챌린지 수정 완료");
      } else {
        await api.post(`/community/challenge`, formData);
        setMessage("챌린지 등록 완료");
      }

      setTimeout(() => navigate("/community/challenge"), 1500);
    } catch (e: any) {
      if (e.response?.status === 401) {
        setError("로그인이 필요합니다.");
        navigate("/login");
      } else {
        setError(
          e.response?.data?.error ||
            (isEdit ? "챌린지 수정 실패" : "챌린지 등록 실패"),
        );
      }
    }
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;

  return (
   <>
   <CommunityHeader />
    <div className={styles.container}>
      <h1>{isEdit ? "챌린지 수정" : "챌린지 등록"}</h1>

      {message && <div className={styles.messageBox}>{message}</div>}
      {error && <div className={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>챌린지 타이틀</label>
          <input
            type="text"
            value={title}
            readOnly
            className={styles.titleDisplay}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>영상 URL (선택)</label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className={styles.urlInput}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>이미지 업로드</label>
          <div className={styles.fileInputBox}>
            <label className={styles.fileButton}>
              선택
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.hiddenInput}
              />
            </label>
            <span className={styles.fileName}>
              {selectedImage?.name || originalServerName || "선택된 파일 없음"}
            </span>
          </div>
        </div>

        <div className={styles.previewBox}>
          {previewImage ? (
            <>
              <img
                src={previewImage}
                alt="미리보기"
                className={styles.previewImage}
              />
              <button
                type="button"
                onClick={handleClearImage}
                className={styles.clearButton}
              >
                이미지 삭제
              </button>
            </>
          ) : (
            "이미지를 선택하세요"
          )}
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            {isEdit ? "수정 완료" : "등록 완료"}
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate("/community/challenge")}
          >
            취소
          </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default ChallengeForm;