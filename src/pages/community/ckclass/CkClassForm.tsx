import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './CkClass.module.css';
import CommunityHeader from '../CommunityHeader';
import axios from 'axios';
import { store } from '../../../store/store';

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

interface CookingClassFormProps {
    isEdit?: boolean;
}

const CkClassForm = ({ isEdit = false }: CookingClassFormProps) => {
    const navigate = useNavigate();
    const { classId } = useParams<{ classId: string }>();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [isCodeEnabled, setIsCodeEnabled] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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
                    navigate('/community/ckclass/');
                }
            };
            fetchClassData();
        }
    }, [isEdit, classId, navigate]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('className', name);
        formData.append('classInfo', description);
        if (isCodeEnabled && joinCode) {
            formData.append('passcode', joinCode);
        }
        const imageFile = (document.getElementById('image-upload') as HTMLInputElement).files?.[0];
        if (imageFile) {
            formData.append('file', imageFile);
        }
        
        try {
            if (isEdit) {
                formData.append('roomNo', classId!);
                await api.put(`/community/ckclass`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                console.log('클래스 수정 완료');
            } else {
                await api.post(`/community/ckclass`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                console.log('클래스 등록 완료');
            }
            navigate('/community/ckclass/');
        } catch (error) {
            console.error("클래스 저장 실패:", error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('정말로 이 클래스를 삭제하시겠습니까?')) {
            try {
                await api.delete(`/community/ckclass/${classId}`);
                console.log('클래스 삭제 완료');
                navigate('/community/ckclass/');
            } catch (error) {
                console.error("클래스 삭제 실패:", error);
            }
        }
    };
    
    const handleCancel = () => {
        navigate('/community/ckclass/');
    };

    return (
        <>
            <CommunityHeader/>
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
                                onChange={(e) => setJoinCode(e.target.value)}
                                disabled={!isCodeEnabled}
                                maxLength={4}
                                required={isCodeEnabled}
                            />
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
                            <button type="submit" className={styles.submitButton}>
                                {isEdit ? '수정' : '등록'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CkClassForm;