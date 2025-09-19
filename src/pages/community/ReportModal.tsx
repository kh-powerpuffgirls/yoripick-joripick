import { useState } from 'react';
import styles from './ReportModal.module.css';
import type { Reply } from './challenge/ChallengeDetail';

interface ReportType {
  value: string;
  label: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reportType: string, content: string, reply?: Reply) => void;
  reportTypes: ReportType[];
  reply?: Reply;
  onReportSuccess?: () => void;
}

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  reportTypes,
  reply,
  onReportSuccess,
}: ReportModalProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [content, setContent] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedType) return alert('신고 유형을 선택해주세요.');
    if (!content.trim()) return alert('신고 사유를 입력해주세요.');

    onSubmit(selectedType, content.trim(), reply);

    setContent('');
    setSelectedType('');

    onReportSuccess?.(); // 성공 후 callback 호출
    onClose(); // 모달 닫기
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>신고하기</h2>

        <div className={styles.formGroup}>
          <label>신고 유형</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">선택하세요</option>
            {reportTypes.map((type, idx) => (
              <option key={idx} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>신고 사유</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="신고 내용을 작성해주세요."
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            취소
          </button>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            신고
          </button>
        </div>
      </div>
    </div>
  );
}
