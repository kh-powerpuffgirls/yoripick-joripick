import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import styles from './CkSettingsModal.module.css';
import axios from 'axios';
import { store } from '../../../store/store';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store/store';
import CommunityModal from '../CommunityModal';

const API_BASE = 'http://localhost:8081';
const getAccessToken = () => store.getState().auth.accessToken;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

interface ClassData { roomNo: number; className: string; classInfo: string; passcode?: string; serverName?: string; }
interface Member { userNo: number; username: string; serverName?: string; notificationStatus: 'Y' | 'N'; }
interface CkSettingsModalProps { isOpen: boolean; onClose: () => void; classId: number; onUpdate: () => void; }

const CkSettingsModal = ({ isOpen, onClose, classId, onUpdate }: CkSettingsModalProps) => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const [activeTab, setActiveTab] = useState('settings');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isCodeEnabled, setIsCodeEnabled] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalCallback, setModalCallback] = useState<(() => void) | undefined>(undefined);
  const [modalShowCancel, setModalShowCancel] = useState(false);

  useEffect(() => {
    if (isOpen && classId && user?.userNo) {
      const fetchClassData = async () => {
        try {
          const response = await api.get<ClassData>(`/community/ckclass/${classId}`);
          const classData = response.data;
          setName(classData.className);
          setDescription(classData.classInfo);
          setJoinCode(classData.passcode || '');
          setIsCodeEnabled(!!classData.passcode);
          setImagePreview(classData.serverName ? `${API_BASE}/images/${classData.serverName}` : null);
        } catch (error) {
          console.error('클래스 정보를 불러오는 데 실패했습니다.', error);
          onClose();
        }
      };

      const fetchMembers = async () => {
        try {
          const response = await api.get<Member[]>(`/community/ckclass/${classId}/members`);
          setMembers(response.data);
          const currentUser = response.data.find(m => m.userNo === user?.userNo);
          if (currentUser) setNotificationEnabled(currentUser.notificationStatus === 'Y');
        } catch (error) {
          console.error('참여자 목록을 불러오는 데 실패했습니다.', error);
        }
      };

      fetchClassData();
      fetchMembers();
    }
  }, [isOpen, classId, onClose, user]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("roomNo", String(classId));
    formData.append("className", name);
    formData.append("classInfo", description);
    formData.append("passcode", isCodeEnabled ? joinCode || '' : '');
    if (file) formData.append("file", file);

    try {
      await api.put(`/community/ckclass`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setModalMessage("클래스 수정이 완료되었습니다.");
      setModalCallback(() => {
        onUpdate();
        setModalOpen(false);
      });
      setModalShowCancel(false);
      setModalOpen(true);
    } catch (error) {
      console.error("클래스 수정 실패:", error);
      setModalMessage("클래스 수정에 실패했습니다.");
      setModalShowCancel(false);
      setModalOpen(true);
    }
  };

  const handleKick = (memberUserNo: number) => {
    setModalMessage('정말로 이 멤버를 강퇴하시겠습니까?');
    setModalShowCancel(true);
    setModalCallback(() => async () => {
      try {
        await api.delete(`/community/ckclass/${classId}/kick/${memberUserNo}`);
        setMembers(members.filter(m => m.userNo !== memberUserNo));
        setModalMessage('멤버가 강퇴되었습니다.');
        setModalShowCancel(false);
        setModalCallback(undefined);
      } catch (error) {
        console.error('멤버 강퇴 실패:', error);
        setModalMessage('멤버 강퇴에 실패했습니다.');
        setModalShowCancel(false);
        setModalCallback(undefined);
      }
    });
    setModalOpen(true);
  };

  const handleMemberClick = (memberUserNo: number) => {
    navigate(`/mypage/${memberUserNo}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h1>쿠킹 클래스 설정</h1>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            클래스 설정
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'members' ? styles.active : ''}`}
            onClick={() => setActiveTab('members')}
          >
            참여자 관리
          </button>
        </div>
        <div className={styles.tabContent}>
          {activeTab === 'settings' && (
            <div className={styles.settingsForm}>
              <div className={styles.formGroup}>
                <label htmlFor="className">클래스 이름</label>
                <input
                  type="text"
                  id="className"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="classInfo">클래스 소개</label>
                <textarea
                  id="classInfo"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className={styles.formGroup}>
                <label>이미지</label>
                <div className={styles.imageUpload}>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="클래스 이미지"
                      className={styles.imagePreview}
                    />
                  )}
                  <label htmlFor="image-upload" className={styles.imageLabel}>이미지 선택</label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.hiddenInput}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={isCodeEnabled}
                    onChange={(e) => setIsCodeEnabled(e.target.checked)}
                  />
                  <span>참여코드</span>
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  disabled={!isCodeEnabled}
                  maxLength={4}
                />
              </div>
            </div>
          )}
          {activeTab === 'members' && (
            <div className={styles.membersList}>
              {members.length > 0 ? (
                members.map((member) => (
                  <div key={member.userNo} className={styles.memberCard}>
                    <div
                      className={styles.profileImage}
                      style={{
                      backgroundImage: `url(${member.serverName ? `${API_BASE}/images/profile/${member.userNo}/${member.serverName}` : '/images/default_profile.png'})`,
                      }}
                      onClick={() => handleMemberClick(member.userNo)}
                    />
                    <span
                      className={styles.username}
                      onClick={() => handleMemberClick(member.userNo)}
                    >
                      {member.username}
                    </span>
                    {member.userNo !== user?.userNo && (
                      <button
                        onClick={() => handleKick(member.userNo)}
                        className={styles.kickButton}
                      >
                        강퇴
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p>참여자가 없습니다.</p>
              )}
            </div>
          )}
        </div>
        <div className={styles.modalFooter}>
          {activeTab === 'settings' && (
            <div className={styles.buttonGroup}>
              <button className={styles.cancelButton} onClick={onClose}>취소</button>
              <button className={styles.submitButton} onClick={handleUpdate}>수정</button>
            </div>
          )}
        </div>

        {/* CommunityModal */}
        {modalOpen && (
          <CommunityModal
            message={modalMessage}
            onClose={() => setModalOpen(false)}
            onConfirm={modalCallback}
            showCancel={modalShowCancel}
          />
        )}
      </div>
    </div>
  );
};

export default CkSettingsModal;
