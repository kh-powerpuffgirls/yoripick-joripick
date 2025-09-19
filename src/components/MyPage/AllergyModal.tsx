import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Modal.module.css";
import type { User } from "../../type/authtype";

interface AllergyDto {
  allergyNo: number;
  name: string;
  category: number | null;
  children?: AllergyDto[];
}

interface AllergyModalProps {
  user: User;
  onClose: () => void;
}

const AllergyModal = ({ user, onClose }: AllergyModalProps) => {
  const [allergyTree, setAllergyTree] = useState<AllergyDto[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);

  useEffect(() => {
    axios.get("/api/user/allergy")
      .then((res) => setAllergyTree(res.data))
      .catch(() => alert("알레르기 데이터를 불러오는데 실패했습니다."));
  }, []);

  const toggleAllergy = (id: number) => {
    setSelectedAllergies((prev) =>
      prev.includes(id)
        ? prev.filter((v) => v !== id)
        : [...prev, id]
    );
  };

  const renderCheckboxTree = (nodes: AllergyDto[]) => {
    return nodes.map((node) => (
      <div key={node.allergyNo} className={styles.checkboxItem}>
        <label>
          <input
            type="checkbox"
            checked={selectedAllergies.includes(node.allergyNo)}
            onChange={() => toggleAllergy(node.allergyNo)}
          />
          {node.name}
        </label>
        {node.children && node.children.length > 0 && (
          <div className={styles.childCheckboxes}>
            {renderCheckboxTree(node.children)}
          </div>
        )}
      </div>
    ));
  };

  const handleSave = () => {
    axios.post("/api/user/allergy", {
      userNo: user.userNo,
      allergyNos: selectedAllergies,
    })
    .then(() => {
      alert("알레르기 정보가 저장되었습니다.");
      onClose();
    })
    .catch(() => {
      alert("저장 중 오류가 발생했습니다.");
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{user.username}님의 알레르기 정보</h2>
        <div className={styles.checkboxList}>
          {renderCheckboxTree(allergyTree)}
        </div>
        <button className={styles.saveBtn} onClick={handleSave}>저장</button>
        <button className={styles.closeBtn} onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default AllergyModal;