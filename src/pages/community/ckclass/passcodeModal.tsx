import { useState } from 'react';
import styles from './PasscodeModal.module.css';

interface PasscodeModalProps {
  className: string;
  correctPasscode?: string | null;
  onConfirm: (input: string) => void;
  onClose: () => void;
}

const PasscodeModal = ({ className, correctPasscode, onConfirm, onClose }: PasscodeModalProps) => {
  const [input, setInput] = useState('');

  const handleConfirm = () => {
    onConfirm(input);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.message}>{className} 참여 코드 입력</p>
        <input
          type="text"
          className={styles.passcodeInput}
          placeholder="참여 코드를 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className={styles.actions}>
          <button className={styles.confirmBtn} onClick={handleConfirm}>확인</button>
          <button className={styles.cancelBtn} onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default PasscodeModal;
