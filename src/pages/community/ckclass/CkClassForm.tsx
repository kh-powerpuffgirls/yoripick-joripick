import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './CkClassForm.module.css';
import CommunityHeader from '../Header/CommunityHeader';
import axios from 'axios';
import { store, type RootState } from '../../../store/store';
import type { ChatRoom, Message } from '../../../type/chatmodal';
import { getRooms, saveMessage } from '../../../api/chatApi';
import { openChat, setRooms } from '../../../features/chatSlice';
import { useDispatch, useSelector } from 'react-redux';
import useChat from '../../../hooks/useChat';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE = 'http://3.38.213.177:8081';
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

interface CookingClassFormProps {
    isEdit?: boolean;
}

const CkClassForm = ({ isEdit = false }: CookingClassFormProps) => {
    const queryClient = useQueryClient();
    const { sendChatMessage } = useChat();
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { classId } = useParams<{ classId: string }>();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [isCodeEnabled, setIsCodeEnabled] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passcodeError, setPasscodeError] = useState('');

    useEffect(() => {
        if (isEdit && classId) {
            const fetchClassData = async () => {
                try {
                    const response = await api.get(`/community/ckclass/${classId}`);
                    const classData = response.data;
                    setName(classData.className);
                    setDescription(classData.classInfo);
                    setJoinCode(classData.passcode || '');
                    setIsCodeEnabled(!!classData.passcode);
                    if (classData.serverName) {
                        setImagePreview(`${API_BASE}/images/${classData.serverName}`);
                    }
                } catch (error) {
                    console.error("클래스 정보를 불러오는 데 실패했습니다:", error);
                    alert('클래스 정보를 불러오는 데 실패했습니다.');
                    navigate('/community/ckclass/');
                }
            };
            fetchClassData();
        }
    }, [isEdit, classId, navigate]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setJoinCode(value);

        if (isCodeEnabled) {
            if (value && !/^\d{4}$/.test(value)) {
                setPasscodeError('참여코드는 4자리 숫자여야 합니다.');
            } else {
                setPasscodeError('');
            }
        } else {
            setPasscodeError('');
        }
    };

    // 클래스 생성 로직
    const mutation = useMutation({
        mutationFn: (formData: FormData) =>
            api.post(`/community/ckclass`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }),
        onSuccess: (res) => {
            alert('클래스 등록이 완료되었습니다.');
            queryClient.invalidateQueries({ queryKey: ["rooms"] });
            getRooms(user?.userNo)
                .then((rooms: ChatRoom[]) => {
                    dispatch(setRooms(rooms));

                    const newRoom = rooms.find(r => r.roomNo === res.data);
                    if (!newRoom) return;
                    dispatch(openChat(newRoom));

                    // 등록 메시지 생성
                    const systemMessage: Message = {
                        userNo: 0,
                        username: "SYSTEM",
                        content: `${newRoom.className} 에 오신 것을 환영합니다`,
                        createdAt: new Date().toISOString(),
                        roomNo: newRoom.roomNo,
                    };

                    // DB 저장
                    let messageBlob = new Blob([JSON.stringify(systemMessage)], { type: "application/json" });
                    let formData = new FormData();
                    formData.append("message", messageBlob);
                    saveMessage("cclass", newRoom.roomNo, formData);

                    // 웹소켓 브로드캐스트
                    sendChatMessage(newRoom.roomNo, systemMessage);
                });
        }
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isCodeEnabled && passcodeError) {
            alert(passcodeError);
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('className', name);
        formData.append('classInfo', description);
        formData.append('passcode', isCodeEnabled ? joinCode : '');

        if (file) {
            formData.append('file', file);
        }

        try {
            if (isEdit) {
                formData.append('roomNo', classId!);
                await api.put(`/community/ckclass`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('클래스 수정이 완료되었습니다.');
            } else {
                mutation.mutate(formData);
            }
            navigate('/community/ckclass/');
        } catch (error: any) {
            console.error("클래스 저장 실패:", error);
            const errorMessage = error.response?.data || "클래스 저장에 실패했습니다.";
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('정말로 이 클래스를 삭제하시겠습니까?')) {
            try {
                await api.delete(`/community/ckclass/${classId}`);
                alert('클래스 삭제가 완료되었습니다.');
                navigate('/community/ckclass/');
            } catch (error: any) {
                console.error("클래스 삭제 실패:", error);
                const errorMessage = error.response?.data || "클래스 삭제에 실패했습니다.";
                alert(errorMessage);
            }
        }
    };

    const handleCancel = () => {
        navigate('/community/ckclass/');
    };

    return (
        <>
            <CommunityHeader />
            <div className={styles.container}>
                <div className={styles.formContainer}>
                    <h1 className={styles.formTitle}>{isEdit ? '나의 클래스 (수정)' : '나의 클래스 (등록)'}</h1>
                    <form onSubmit={handleSubmit} className={styles.formSpace}>
                        <input
                            type="text"
                            placeholder="쿠킹 클래스 이름"
                            className={styles.inputField}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="쿠킹 클래스 소개"
                            className={styles.contentTextarea}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                        <div className={styles.imageUploadArea}>
                            <div>
                                <span className={styles.uploadText}>클래스 이미지</span>
                            </div>
                            <label htmlFor="image-upload" className={styles.labelButton}>
                                파일 선택
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className={styles.hiddenInput}
                            />
                        </div>
                        {imagePreview && (
                            <div className={styles.imagePreviewContainer}>
                                <img src={imagePreview} alt="Class Preview" className={styles.imagePreview} />
                            </div>
                        )}
                        <div className={styles.joinCodeSection}>
                            <label className={styles.joinCodeLabel}>
                                <input
                                    type="checkbox"
                                    checked={isCodeEnabled}
                                    onChange={(e) => setIsCodeEnabled(e.target.checked)}
                                />
                                참여코드 설정
                            </label>
                            <input
                                type="text"
                                placeholder="참여코드 (4자리 숫자)"
                                className={styles.inputField}
                                value={joinCode}
                                onChange={handleCodeChange}
                                disabled={!isCodeEnabled}
                                maxLength={4}
                            />
                            {isCodeEnabled && passcodeError && <p className={styles.errorText}>{passcodeError}</p>}
                        </div>
                        <div className={styles.buttonGroup}>
                            <button type="button" className={styles.cancelButton} onClick={handleCancel}>
                                취소
                            </button>
                            {isEdit && (
                                <button type="button" className={styles.deleteButton} onClick={handleDelete}>
                                    삭제
                                </button>
                            )}
                            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                                {isSubmitting ? '처리 중...' : (isEdit ? '수정' : '등록')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CkClassForm;
