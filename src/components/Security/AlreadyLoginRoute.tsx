import { useEffect, useState, type ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import type { RootState } from "../../store/store";
import { loginSuccess } from "../../features/authSlice";

interface Props {
  children: ReactNode;
}

export default function AlreadyLoginRoute({ children }: Props) {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
   const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const target = (location.state as { from?: Location })?.from?.pathname || "/home";

  useEffect(() => {
    if (!isAuthenticated && user) {
      dispatch(loginSuccess());
    } else 
    if (isAuthenticated && (location.pathname === "/login" || (!target || target === "/" || target === "/login"))) {
      alert("이미 로그인된 사용자입니다. 이전 페이지로 돌아갑니다.");
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, location.pathname]);

  return <>{children}</>;
}