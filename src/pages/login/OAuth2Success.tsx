import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { loginSucess } from "../../features/authSlice";
import Unauthorized from "../ErrorPage/Unauthorized";

export default function OAuth2Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    const param = new URLSearchParams(location.search);
    const accessToken = param.get("accessToken") as string;

    axios
      .get("http://localhost:8081/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        dispatch(loginSucess({ accessToken, user: res.data }));
        navigate("/menus", { state: { flash: "로그인 완료" }, replace: true });
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          setIsUnauthorized(true);
        } else {
          console.error(error);
        }
      });
  }, []);

  if (isUnauthorized) {
    return <Unauthorized />;
  }

  return <div><p>로그인 처리중...</p></div>;
}
