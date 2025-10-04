import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { store } from "../../../store/store";
import axios from "axios";
import style from "./ChallengeSuggestionForm.module.css";

const API_BASE_URL = "http://3.38.213.177:8081";

const getAccessToken = () => store.getState().auth.accessToken;

const api = axios.create({
  baseURL: API_BASE_URL,
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

interface ChallengeSuggestionFormProps {
  onClose?: () => void; 
}

function ChallengeSuggestionForm({ onClose }: ChallengeSuggestionFormProps) {
  const [title, setTitle] = useState("");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userNo = useSelector((state: RootState) => state.auth.user?.userNo);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null); 
    
    if (!title || !description) {
      setErrorMessage("제목과 내용은 필수 입력 항목입니다.");
      return;
    }

    if (!userNo) {
      setErrorMessage("로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      await api.post("/community/challenge/suggestion", {
        chTitle: title,
        reference,
        description,
        userNo: userNo,
      });
      alert("챌린지 신청서가 등록되었습니다.");
      onClose?.();
    } catch (error) {
      console.error("등록 실패", error);
      setErrorMessage("등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={style.modalBackdrop} onClick={onClose}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        <div className={style.modalHeader}>
          <h1 className={style.formTitle}>새 챌린지 요청</h1>
          <button type="button" className={style.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={style.modalBody}>
          <form onSubmit={handleSubmit}>
            {errorMessage && <p className={style.errorMessage}>{errorMessage}</p>}
            
            <div className={style.formGroup}>
              <label htmlFor="challengeTitle" className={style.label}>
                챌린지 제목 <span className={style.required}>*</span>
              </label>
              <input
                id="challengeTitle"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력해 주세요"
                className={style.inputField}
              />
            </div>

            <div className={style.formGroup}>
              <label htmlFor="challengeDescription" className={style.label}>
                챌린지 설명 <span className={style.required}>*</span>
              </label>
              <textarea
                id="challengeDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="내용을 입력해 주세요"
                className={style.textareaField}
              />
            </div>

            <div className={style.formGroup}>
              <label htmlFor="challengeReference" className={style.label}>
                참고 URL
              </label>
              <input
                id="challengeReference"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="참고 URL을 입력해 주세요"
                className={style.inputField}
              />
            </div>

            <div className={style.buttonContainer}>
              <button
                type="button"
                className={style.cancelButton}
                onClick={onClose}
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="submit"
                className={style.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? '요청 중...' : '등록하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChallengeSuggestionForm;
