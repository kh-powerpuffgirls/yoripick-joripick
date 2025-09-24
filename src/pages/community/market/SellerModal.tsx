import { useState } from 'react';
import styles from './SellerModal.module.css';

interface SellerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function SellerModal({ isOpen, onClose, onConfirm }: SellerModalProps) {
    const [isChecked, setIsChecked] = useState(false); 

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <span className={styles.pin}>📌</span>
                    <h2 className={styles.title}>판매자 준수사항</h2>
                </div>
                <div className={styles.content}>
                    <p className={styles.promise}>판매자님, 약속해 주세요!</p>
                    <ul className={styles.rules}>
                        <li>배송지연은 최대한 지양해주세요.</li> 
                        <li>입금 확인 후, 즉시 구매자에게 구매 확인 문자를 보내주세요.</li> 
                        <li>구매자의 개인정보는 마케팅 등의 다른 목적으로 사용할 수 없어요.</li> 
                        <li>개인정보는 배송/반품/환불 또는 고객 상담이 완료된 후에만 삭제해 주세요.</li> 
                    </ul>
                    <div className={styles.disclaimerBox}>
                        <p>
                            위 사항을 성실히 이행하지 않을 시,<br />
                            관련 법에 의거하여 법적인 조치를 받을 수 있음을 인지하였습니다.
                        </p>
                        <label className={styles.checkboxLabel}>
                            <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={(e) => setIsChecked(e.target.checked)} 
                            />
                            위 내용을 확인하였습니다.
                        </label>
                    </div>
                </div>
                <div className={styles.actions}>
                    <button 
                        className={styles.confirmBtn} 
                        onClick={onConfirm} 
                        disabled={!isChecked} 
                    >
                        확인
                    </button>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
}
