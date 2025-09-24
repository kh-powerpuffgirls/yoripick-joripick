import { useState } from 'react';
import styles from './BuyCompleteModal.module.css';

interface BuyCompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
    totalPrice: number;
    accountNo: string;
    isComplete?: boolean;
}

export default function BuyCompleteModal({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    totalPrice,
    accountNo,
    isComplete = false,
}: BuyCompleteModalProps) {
    const [isChecked, setIsChecked] = useState(false);

    if (!isOpen) {
        return null;
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                {isComplete ? (
                    <>
                        <div className={styles.modalHeader}>
                            <h2>구매 신청 완료</h2>
                            <button className={styles.closeButton} onClick={onClose}>X</button>
                        </div>
                        <div className={styles.modalBody}>
                            <p><strong>'{itemName}'</strong> 상품에 대한 구매 신청이 완료되었습니다. 아래 정보를 확인해주세요.</p>
                            <div className={styles.modalDetail}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>총 결제 금액</span>
                                    <span>{totalPrice.toLocaleString()} 원</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>판매자 계좌</span>
                                    <span>{accountNo}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <p>입금 후, 판매자가 거래를 확인하면 상품이 발송됩니다.</p>
                            <div className={styles.buttonGroup}>
                                <button className={styles.confirmButton} onClick={onClose}>
                                    확인
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.modalHeader}>
                            <h2>구매 확인</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <p><strong>'{itemName}'</strong> 상품을 구매하시겠습니까?</p>
                            <p>상품을 구매한 후에는 취소할 수 없습니다. 판매자에게 직접 연락해야만 취소가 가능합니다.</p>
                            <div className={styles.purchaseDetails}>
                                <p><strong>총 결제 금액:</strong> {totalPrice.toLocaleString()} 원</p>
                                <p><strong>입금 계좌:</strong> {accountNo}</p>
                            </div>
                            <div className={styles.checkboxContainer}>
                                <input
                                    type="checkbox"
                                    id="buyAgreement"
                                    checked={isChecked}
                                    onChange={(e) => setIsChecked(e.target.checked)}
                                />
                                <label htmlFor="buyAgreement">
                                    위 내용을 확인하였으며, 구매에 동의합니다.
                                </label>
                            </div>
                        </div>
                        <div className={styles.buttonGroup}>
                            <button
                                className={styles.confirmButton}
                                onClick={onConfirm}
                                disabled={!isChecked}
                            >
                                확인
                            </button>
                            <button
                                className={styles.cancelButton}
                                onClick={onClose}
                            >
                                취소
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}