import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import styles from './CkSettingsModal.module.css';
import axios from 'axios';
import { store } from '../../../store/store';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store/store';
import { useQueryClient } from '@tanstack/react-query';
import useChat from '../../../hooks/useChat';
import type { Message } from '../../../type/chatmodal';
import { saveMessage } from '../../../api/chatApi';

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

interface ClassData {
  roomNo: number;
  className: string;
  classInfo: string;
  passcode?: string;
  serverName?: string;
}

interface Member {
  userNo: number;
  username: string;
  serverName?: string;
  notificationStatus: 'Y' | 'N';
}

interface CkSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
  onUpdate: () => void;
}

const CkSettingsModal = ({ isOpen, onClose, classId, onUpdate }: CkSettingsModalProps) => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const queryClient = useQueryClient();
  const { sendChatMessage, rmvCKclass } = useChat();
  const [activeTab, setActiveTab] = useState('settings');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isCodeEnabled, setIsCodeEnabled] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(true);

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
    formData.append('roomNo', String(classId));
    formData.append('className', name);
    formData.append('classInfo', description);
    if (isCodeEnabled && joinCode) formData.append('passcode', joinCode);
    if (!isCodeEnabled) formData.append('passcode', "");
    if (file) formData.append('file', file);

    try {
      await api.put(`/community/ckclass`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('클래스 수정이 완료되었습니다.');
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      rmvCKclass(classId);
      onUpdate();
    } catch (error) {
      console.error('클래스 수정 실패:', error);
      alert('클래스 수정에 실패했습니다.');
    }
  };

  const handleKick = async (member: Member) => {
    if (window.confirm('정말로 이 멤버를 강퇴하시겠습니까?')) {
      try {
        await api.delete(`/community/ckclass/${classId}/kick/${member.userNo}`);
        setMembers(members.filter(m => m.userNo !== member.userNo));
        rmvCKclass(classId);
        alert('멤버가 강퇴되었습니다.');

        // 강퇴 메시지 생성
        const systemMessage: Message = {
          userNo: 0,
          username: "SYSTEM",
          content: `${member.username} 님이 강퇴되었습니다`,
          createdAt: new Date().toISOString(),
          roomNo: classId,
        };

        // DB 저장
        let messageBlob = new Blob([JSON.stringify(systemMessage)], { type: "application/json" });
        let formData = new FormData();
        formData.append("message", messageBlob);
        await saveMessage("cclass", classId, formData);

        // 웹소켓 브로드캐스트
        sendChatMessage(classId, systemMessage);
    } catch (error) {
      console.error('멤버 강퇴 실패:', error);
      alert('멤버 강퇴에 실패했습니다.');
    }
  }
};

const handleLeaveClass = async () => {
  if (window.confirm('정말로 이 클래스를 나가시겠습니까?')) {
    try {
      await api.delete(`/community/ckclass/${classId}/leave`);
      alert('클래스를 나갔습니다.');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('클래스 나가기 실패:', error);
      alert('클래스 나가기에 실패했습니다.');
    }
  }
};

const handleToggleNotification = async () => {
  try {
    await api.put(`/community/ckclass/${classId}/notification`);
    setNotificationEnabled(prev => !prev);
    alert(`알림이 ${notificationEnabled ? '꺼졌습니다' : '켜졌습니다'}.`);
  } catch (error) {
    console.error('알림 설정 실패:', error);
    alert('알림 설정을 변경하는 데 실패했습니다.');
  }
};

const handleMemberClick = (memberUserNo: number) => {
  navigate(`/mypage/${memberUserNo}`);
  onClose();
};

if (!isOpen) return null;

const isMyClass = members.some(m => m.userNo === user?.userNo);
const isCreator = isMyClass && user?.userNo === members.find(m => m.userNo === user?.userNo)?.userNo;

return (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <h1>쿠킹 클래스 설정</h1>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
      </div>
      <div className={styles.tabContainer}>
        <button className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}>클래스 설정</button>
        <button className={`${styles.tabButton} ${activeTab === 'members' ? styles.active : ''}`} onClick={() => setActiveTab('members')}>참여자 관리</button>
      </div>
      <div className={styles.tabContent}>
        {activeTab === 'settings' && (
          <div className={styles.settingsForm}>
            <div className={styles.formGroup}>
              <label htmlFor="className">클래스 이름</label>
              <input type="text" id="className" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="classInfo">클래스 소개</label>
              <textarea id="classInfo" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={30} />
            </div>
            <div className={styles.formGroup}>
              <label>이미지</label>
              <div className={styles.imageUpload}>
                {imagePreview && <img src={imagePreview} alt="클래스 이미지" className={styles.imagePreview} />}
                <label htmlFor="image-upload" className={styles.imageLabel}>이미지 선택</label>
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className={styles.hiddenInput} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>
                <input type="checkbox" checked={isCodeEnabled} onChange={(e) => setIsCodeEnabled(e.target.checked)} />
                참여 코드
              </label>
              <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} disabled={!isCodeEnabled} maxLength={4} />
            </div>
          </div>
        )}
        {activeTab === 'members' && (
          <div className={styles.membersList}>
            {members.length > 0 ? (
              members.map((member) => (
                <div key={member.userNo} className={styles.memberCard}>
                  <div className={styles.profileImage} style={{ backgroundImage: `url(${member.serverName ? `${API_BASE}/images/${member.serverName}` : '/images/default_profile.png'})` }} onClick={() => handleMemberClick(member.userNo)}></div>
                  <span className={styles.username} onClick={() => handleMemberClick(member.userNo)}>{member.username}</span>
                  {member.userNo !== user?.userNo && <button onClick={() => handleKick(member)} className={styles.kickButton}>강퇴</button>}
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
        {user && user.userNo && !isCreator && (
          <div className={styles.userActions}>
            <button className={`${styles.actionButton} ${styles.notificationButton}`} onClick={handleToggleNotification}>
              알림 {notificationEnabled ? '끄기' : '켜기'}
            </button>
            <button className={`${styles.actionButton} ${styles.leaveButton}`} onClick={handleLeaveClass}>
              채팅방 나가기
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default CkSettingsModal;