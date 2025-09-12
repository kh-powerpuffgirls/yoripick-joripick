import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import style from '../../../components/alertModal.module.css';

interface ChallengeSuggestionFormProps {
  onClose?: () => void;
}

function ChallengeSuggestionForm({ onClose }: ChallengeSuggestionFormProps) {
  const [title, setTitle] = useState("");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  // Redux 스토어에서 userNo 가져오기
  const userNo = useSelector((state: RootState) => state.user.userNo);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !description) {
      alert("제목과 내용은 필수 입력 항목입니다.");
      return;
    }

    // userNo가 없을 경우 요청을 막음
    if (!userNo) {
      alert("로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      await axios.post("http://localhost:8081/community/challenge/suggestion", {
        chTitle: title,
        reference,
        description,
        userNo: userNo, // 하드코딩된 값 대신 Redux에서 가져온 userNo 사용
      });
      alert("챌린지 신청서가 등록되었습니다.");
      onClose?.(); 
    } catch (error) {
      console.error("등록 실패", error);
      alert("등록에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose(); 
    } else {
      console.log("onClose가 없어서 모달을 닫을 수 없습니다.");
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
            <button type="button" onClick={handleCancel}>
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