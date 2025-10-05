import React, { useState, useRef } from "react";
import axios, { AxiosError } from "axios";
import styles from "./Modal.module.css";
import type { User } from "../../type/authtype";
import errorMessages from "../ErrorMessages";
import { useDispatch } from "react-redux";
import { updateUserInfo } from "../../features/authSlice";
import { api } from "../../api/authApi";

interface MemberInfoModalProps {
  user: User;
  onClose: () => void;
}

const MemberInfoModal = ({ user, onClose }: MemberInfoModalProps) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);

  const [isEditingUsername, setEditingUsername] = useState(false);
  const [isEditingEmail, setEditingEmail] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<null | boolean>(null);
  const [emailStatus, setEmailStatus] = useState<null | boolean>(null);

  const [emailSent, setEmailSent] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [emailCode, setEmailCode] = useState("");
  const [emailVerified, setEmailVerified] = useState<null | boolean>(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPwCheck, setNewPwCheck] = useState("");
  const [passwordValid, setPasswordValid] = useState<null | boolean>(null);
  const [passwordMatch, setPasswordMatch] = useState<null | boolean>(null);

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();

  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const getByteLength = (str: string) => {
    let byteLength = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (
        (code >= 0xac00 && code <= 0xd7a3) ||
        (code >= 0x1100 && code <= 0x1112) ||
        (code >= 0x1161 && code <= 0x1175) ||
        (code >= 0x11a8 && code <= 0x11c2)
      ) {
        byteLength += 2;
      } else {
        byteLength += 1;
      }
    }
    return byteLength;
  };

  const validateUsername = (val: string) => {
    const len = getByteLength(val);
    const pattern = /^[\u1100-\u11FF가-힣ㄱ-ㅎa-zA-Z0-9]+$/;
    return pattern.test(val) && len >= 4 && len <= 16;
  };

  const validatePassword = (val: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*]).{8,15}$/.test(val);

  const handleCheckUsername = async () => {
    if (!validateUsername(username)) {
      alert("닉네임 형식이 올바르지 않습니다.(한글/영문/숫자 4~16byte)");
      usernameRef.current?.focus();
      return;
    }
    try {
      const res = await axios.get("https://api.ypjp.store:8443/auth/users/check", {
        params: { username },
      });
      setUsernameStatus(res.data.available);
    } catch {
      alert("닉네임 중복 확인 중 오류가 발생했습니다.");
    }
  };

  const handleCheckEmail = async () => {
    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      alert("이메일 형식이 올바르지 않습니다.");
      emailRef.current?.focus();
      return;
    }
    try {
      const res = await axios.post("https://api.ypjp.store:8443/auth/email-codes", {
        email: trimmedEmail,
      });
      setEmailStatus(res.data.available);
      setEmailSent(true);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    } catch (err) {
      const error = err as AxiosError<{ errorCode: string; message?: string }>;
      if (error.response) {
        const { errorCode } = error.response.data;
        if (errorCode === "EMAIL_ALREADY_EXISTS") {
          setEmailStatus(false);
          return;
        }
        if (errorCode === "INVALID_EMAIL") {
          alert(errorMessages[errorCode]);
          return;
        }
      }
      alert("네트워크 오류가 발생했습니다.");
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await axios.post("https://api.ypjp.store:8443/auth/email-codes/verify", {
        email,
        code: emailCode,
      });
      setEmailVerified(res.data.verified === true);
    } catch {
      alert("인증번호 확인 중 오류가 발생했습니다.");
      setEmailVerified(false);
    }
  };

  const onNewPwChange = (val: string) => {
    setNewPw(val);
    setPasswordValid(validatePassword(val));
    setPasswordMatch(val === newPwCheck);
  };

  const onNewPwCheckChange = (val: string) => {
    setNewPwCheck(val);
    setPasswordMatch(newPw === val);
  };

  const handleSave = async () => {
    if (isEditingUsername && usernameStatus !== true) {
      return alert("닉네임 중복확인을 해주세요.");
    }
    if (isEditingEmail) {
      if (emailStatus !== true) return alert("이메일 중복확인을 해주세요.");
      if (emailVerified !== true) return alert("이메일 인증을 완료해주세요.");
    }
    if (newPw && (!passwordValid || passwordMatch !== true)) {
      return alert("비밀번호 조건을 만족하거나 확인이 일치해야 합니다.");
    }

    const updatePayload: Record<string, string> = {};
    if (isEditingUsername) updatePayload.username = username;
    if (isEditingEmail) updatePayload.email = email;
    if (newPw) {
      updatePayload.currentPassword = currentPw;
      updatePayload.newPassword = newPw;
    }

    updatePayload.userNo = String(user.userNo);
    if (Object.keys(updatePayload).length === 0) {
      return alert("변경된 내용이 없습니다.");
    }

    try {
      const res = await api.put("/users/update", updatePayload);
      alert(res.data.message);

      dispatch(updateUserInfo({
      username: isEditingUsername ? username : undefined,
      email: isEditingEmail ? email : undefined,
    }));

      onClose();
    } catch (err) {
      const error = err as AxiosError<{ errorCode?: string; message?: string }>;
      if (error.response?.data?.errorCode) {
        const errorCode = error.response.data.errorCode;
        alert(errorMessages[errorCode] ?? "알 수 없는 오류가 발생했습니다.");
      } else {
        alert("네트워크 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>회원 정보 수정</h2>
          <button className={styles.closeBtn} onClick={onClose}>✖</button>
        </div>

        <label>닉네임</label>
        {isEditingUsername ? (
          <div className={styles.inputRow}>
            <input
              value={username}
              onChange={e => { setUsername(e.target.value); setUsernameStatus(null); }}
              ref={usernameRef}
              placeholder="한글·영문·숫자 4~16byte"
            />
            <button type="button" className={styles.subBtn} onClick={handleCheckUsername}>중복확인</button>
            <button type="button" className={styles.cancelBtn} onClick={() => setEditingUsername(false)}>취소</button>
          </div>
        ) : (
          <div className={styles.inputRow}>
            <span>{username}</span>
            <button type="button" className={styles.subBtn} onClick={() => setEditingUsername(true)}>수정</button>
          </div>
        )}
        {usernameStatus === true && <p className={styles.successTextSmall}>사용 가능한 닉네임입니다</p>}
        {usernameStatus === false && <p className={styles.errorTextSmall}>중복된 닉네임입니다</p>}

        {user.provider === null && (
          <>
            <label>이메일</label>
            {isEditingEmail ? (
              <div className={styles.inputRow}>
                <input
                  type="email"
                  className={styles.emailInput}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailStatus(null); setEmailVerified(null); }}
                  ref={emailRef}
                  placeholder="이메일은 중복될 수 없습니다."
                />
                <button type="button" className={styles.subBtn} onClick={handleCheckEmail}>중복확인</button>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditingEmail(false)}>취소</button>
              </div>
            ) : (
              <div className={styles.inputRow}>
                <span>{email}</span>
                <button type="button" className={styles.subBtn} onClick={() => setEditingEmail(true)}>수정</button>
              </div>
            )}

            {emailStatus === true && <p className={styles.successTextSmall}>사용 가능한 이메일입니다. 인증번호를 입력해주세요.</p>}
            {emailStatus === false && <p className={styles.errorTextSmall}>중복된 이메일입니다</p>}

            {isEditingEmail && emailSent && (
              <div className={styles.inputRow}>
                <input
                  type="text"
                  value={emailCode}
                  onChange={(e) => { setEmailCode(e.target.value); setEmailVerified(null); }}
                  placeholder="인증번호 입력"
                />
                <button type="button" className={styles.subBtn} onClick={handleVerifyCode}>인증</button>
              </div>
            )}
            {emailVerified === true && <p className={styles.successTextSmall}>이메일 인증 완료</p>}
            {emailVerified === false && <p className={styles.errorTextSmall}>인증번호가 올바르지 않습니다.</p>}

            <label>현재 비밀번호</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />

            <label>새 비밀번호</label>
            <input
              type="password"
              value={newPw}
              onChange={e => onNewPwChange(e.target.value)}
              placeholder="영문, 숫자, 특수문자 포함 8~15자"
            />
            {newPw && passwordValid === false && (
              <p className={styles.errorTextSmall}>
                비밀번호는 영문, 숫자, 특수문자 포함 8~15글자이어야 합니다.
              </p>
            )}

            <label>새 비밀번호 확인</label>
            <input
              type="password"
              value={newPwCheck}
              onChange={e => onNewPwCheckChange(e.target.value)}
              placeholder="비밀번호 동일하게 입력해주세요."
            />
            {passwordMatch === true && <p className={styles.successTextSmall}>비밀번호가 일치합니다.</p>}
            {passwordMatch === false && <p className={styles.errorTextSmall}>비밀번호가 다릅니다.</p>}
          </>
        )}

        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave}>저장</button>
          <button className={styles.closeBtn} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default MemberInfoModal;
