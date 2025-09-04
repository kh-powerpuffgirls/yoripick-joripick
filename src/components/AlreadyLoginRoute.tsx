import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface Props {
  children: ReactNode;
}

export default function AlreadyLoginRoute({ children }: Props) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      alert("이미 로그인된 사용자입니다. 이전 페이지로 돌아갑니다.");
        navigate(-1);
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, navigate]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}