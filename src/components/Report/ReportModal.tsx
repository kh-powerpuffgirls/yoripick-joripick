import React, { useState, useEffect, useMemo } from 'react';
import styles from './ReportModal.module.css';

interface ReportOption {
  reportType: string;
  category: string;
  detail: string;
}

interface ReportTargetInfo {
  author: string;
  title: string;
  category: string;
  refNo: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reportType: string, content: string, refNo: number, refType: string) => Promise<void>;
  reportOptions: ReportOption[];
  targetInfo: ReportTargetInfo;
}

function ReportModal({ isOpen, onClose, onSubmit, reportOptions, targetInfo }: Props) {
  const [selectedType, setSelectedType] = useState('');
  const [content, setContent] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportStatus, setReportStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const filteredOptions = useMemo(
    () => reportOptions.filter(option => option.category === targetInfo.category),
    [reportOptions, targetInfo.category]
  );

  useEffect(() => {
    setSelectedType(filteredOptions.length > 0 ? filteredOptions[0].reportType : '');
  }, [filteredOptions]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedType) return alert('신고 사유를 선택해주세요.');
    if (!content.trim()) return alert('신고 내용을 입력해주세요.');
    if (!isAgreed) return alert('신고 규정에 동의해야 신고할 수 있습니다.');

    setIsSubmitting(true);
    try {
      await onSubmit(selectedType, content.trim(), targetInfo.refNo, targetInfo.category);
      setReportStatus('success');
    } catch (error) {
      console.error('신고 제출 중 오류 발생:', error);
      setReportStatus('failed');
      alert('신고 제출 중 오류가 발생했습니다.');
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReportStatus('pending');
    setContent('');
    setSelectedType('');
    setIsAgreed(false);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {reportStatus === 'success' ? (
          <div className={styles.successMessage}>
            <h2>신고가 접수되었습니다.</h2>
            <p>신고해주셔서 감사합니다. 접수된 신고는 관리자가 신속하게 처리하겠습니다.</p>
            <button className={styles.confirmBtn} onClick={handleClose}>확인</button>
          </div>
        ) : (
          <>
            <h2>해당 게시글을 신고하시겠습니까?</h2>
            <div className={styles.targetInfo}>
              <div className={styles.authorName}>{targetInfo.author}</div>
              <div className={styles.postTitle}>{targetInfo.title}</div>
            </div>
            <div className={styles.reportForm}>
              <div className={styles.selectGroup}>
                <button className={styles.categoryBtn} disabled>{targetInfo.category}</button>
                <select
                  className={styles.reasonSelect}
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="" disabled>사유 선택</option>
                  {filteredOptions.map(option => (
                    <option key={option.reportType} value={option.reportType}>{option.detail}</option>
                  ))}
                </select>
              </div>
              <textarea
                className={styles.contentInput}
                placeholder="신고 내용을 작성해주세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className={styles.warningBox}>
                <p>허위 신고 적발 시,<br />커뮤니티 규정에 따라 경고 및 이용 제한 등의 제재를 받게 됩니다.</p>
              </div>
              <label className={styles.agreement}>
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                />
                <span className={styles.agreementText}>위 내용에 동의합니다.</span>
              </label>
            </div>
            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={handleClose} disabled={isSubmitting}>취소</button>
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedType || !content.trim() || !isAgreed}
              >
                {isSubmitting ? '신고 처리 중...' : '신고'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportModal;