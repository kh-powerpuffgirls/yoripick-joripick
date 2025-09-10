import { useNavigate } from "react-router-dom";
import errorImage from "./401error.png";  // 경로 조정 필요

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <img src={errorImage} alt="401 Error" style={{ maxWidth: "300px" }} />
      <h1>Authorization Required</h1>
      <p>🚫 접근이 거부되었습니다.</p>
      <p>
        요청하신 페이지 접근이 거부되었습니다.
        <br />
        입력하신 페이지의 주소가 정확한지 다시 확인해주세요.
      </p>
      <button onClick={() => navigate(-1)}>← 이전 페이지</button>
      <button onClick={() => navigate("/")}>🏠 홈으로</button>
    </div>
  );
}