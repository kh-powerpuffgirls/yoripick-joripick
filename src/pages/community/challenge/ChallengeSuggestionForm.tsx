import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { store } from "../../../store/store";
import axios from "axios";
import style from "./ChallengeSuggestionForm.module.css";

const API_BASE_URL = "http://localhost:8081";

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
  onClose: () => void; // 모달 전용이라서 필수에여
}

function ChallengeSuggestionForm({ onClose }: ChallengeSuggestionFormProps) {
  const [title, setTitle] = useState("");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");

  const userNo = useSelector((state: RootState) => state.auth.user?.userNo);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !description) {
      alert("제목과 내용은 필수 입력 항목입니다.");
      return;
    }

    if (!userNo) {
      alert("로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      await api.post("/community/challenge/suggestion", {
        chTitle: title,
        reference,
        description,
        userNo: userNo,
      });
      alert("챌린지 신청서가 등록되었습니다.");
      onClose(); // 등록 후 모달 닫기
    } catch (error) {
      console.error("등록 실패", error);
      alert("등록에 실패했습니다.");
    }
  };

  return (
    <div className={style.modalBackdrop}>
      <div className={style.modal}>
        <h1>새로운 챌린지 요청하기</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
          />
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="참고 URL"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="내용"
          />
          <div>
            <button type="button" onClick={onClose}>
              취소
            </button>
            <button type="submit">등록하기</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChallengeSuggestionForm;
