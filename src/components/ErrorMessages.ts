const errorMessages: Record<string, string> = {
  WRONG_PASSWORD: "비밀번호가 일치하지 않습니다.",
  WRONG_EMAIL: "존재하지 않는 이메일입니다.",
  ACCOUNT_LOCKED: "계정이 잠겼습니다. 관리자에게 문의하세요.",
  EMAIL_ALREADY_EXISTS: "이미 가입된 이메일입니다.",
  USERNAME_ALREADY_EXISTS: "이미 사용 중인 닉네임입니다.",
  INVALID_EMAIL: "올바른 이메일 형식이 아닙니다.",
  INVALID_USERNAME: "닉네임은 4~16바이트의 영문/숫자/한글만 가능합니다.",
  INVALID_PASSWORD: "비밀번호는 8~15자의 영문, 숫자, 특수문자를 포함해야 합니다.",
  UPDATE_FAILED:"회원정보 수정에 실패했습니다.",
  INTERNAL_SERVER_ERROR:"서버 오류가 발생했습니다.",
  INVALID_CURRENT_PASSWORD:"현재 비밀번호가 맞지않습니다.",
  LARGE_FILE:"파일이 너무 큽니다. 다른 파일을 올려주세요.",
  UPLOAD_FAILED:"업로드 실패. 파일형식 또는 네트워크를 확인해주세요.",
  INACTIVE_USER:"회원탈퇴신청한 회원입니다.",
};

export default errorMessages;