import { useState } from "react";
import styles from "./rcpAlertModal.module.css";

interface RcpAlertModalProps {
  open: boolean;
  title?: string;
  message?: string;
  input?: boolean;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

export const RcpAlertModal = ({
  open,
  title,
  message,
  input,
  onConfirm,
  onCancel,
}: RcpAlertModalProps) => {
  const [value, setValue] = useState("");

  if (!open) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {message && <p className={styles.message}>{message}</p>}
        {input && (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="레시피 공식화 기각 사유를 입력하세요."
            className={styles.input}
          />
        )}
        <div className={styles.buttons}>
          <button
            className={styles.confirm}
            onClick={() => {
              onConfirm(input ? value : undefined);
              setValue("");
            }}
          >
            확인
          </button>
          <button
            className={styles.cancel}
            onClick={() => {
              onCancel();
              setValue("");
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
