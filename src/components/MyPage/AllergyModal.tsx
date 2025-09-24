import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Modal.module.css";
import type { User } from "../../type/authtype";
import { api } from "../../api/authApi";
import { useDispatch } from "react-redux";
import {updateUserAllergies} from "../../features/authSlice"

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


const getAllDescendantIds = (node: AllergyDto): number[] => {
  let ids = [node.allergyNo];
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      ids = ids.concat(getAllDescendantIds(child));
    });
  }
  return ids;
};


const AllergyModal = ({ user, onClose }: AllergyModalProps) => {
  const dispatch = useDispatch();
  const [allergyTree, setAllergyTree] = useState<AllergyDto[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);

  useEffect(() => {
    api.get("/mypage/users/allergy-list")
      .then((res) => {
        setAllergyTree(res.data);
      })
      .catch(() => alert("알레르기 데이터를 불러오는데 실패했습니다."));

    api.get("/mypage/users/allergy", {
      params: { userNo: user.userNo },
    })
      .then((res) => {
        setSelectedAllergies(res.data);
      })
      .catch(() => alert("유저의 알러지 정보를 불러오는데 실패했습니다."));
  }, [user.userNo]);

  const toggleAllergy = (node: AllergyDto) => {
    const allIds = getAllDescendantIds(node);

    setSelectedAllergies((prev) => {
      const isAllSelected = allIds.every((id) => prev.includes(id));
      if (isAllSelected) {
        return prev.filter((id) => !allIds.includes(id));
      } else {
        return [...new Set([...prev, ...allIds])];
      }
    });
  };

  const isChecked = (node: AllergyDto): boolean => {
    if (node.children && node.children.length > 0) {
      return node.children.every((child) => isChecked(child));
    }
    return selectedAllergies.includes(node.allergyNo);
  };

  const renderCheckboxTree = (nodes: AllergyDto[]) => {
    return nodes.map((node) => (
      <div key={node.allergyNo} className={styles.checkboxItem}>
        <label>
          <input
            type="checkbox"
            checked={isChecked(node)}
            onChange={() => toggleAllergy(node)}
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
    api.post("/mypage/update/users/allergy", {
      userNo: user.userNo,
      allergyNos: selectedAllergies,
    })
      .then(() => {
        alert("알레르기 정보가 저장되었습니다.");
        dispatch(updateUserAllergies(selectedAllergies));
        onClose();
      })
      .catch(() => {
        alert("저장 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.amodalContent}>
        <h2>{user.username}님의 알레르기 정보</h2>
        <div className={styles.checkboxList}>
          {renderCheckboxTree(allergyTree)}
        </div>
        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave}>저장</button>
          <button className={styles.closeBtn} onClick={onClose}>닫기</button>
        </div>

      </div>
    </div>
  );
};

export default AllergyModal;