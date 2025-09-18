import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './CkClass.module.css';
import CommunityHeader from '../CommunityHeader';

interface CookingClassFormProps {
    isEdit?: boolean;
}

const CkClassForm = ({ isEdit = false }: CookingClassFormProps) => {
    const navigate = useNavigate();
    const { classId } = useParams<{ classId: string }>();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [isCodeEnabled, setIsCodeEnabled] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit && classId) {
            const dummyData = {
                name: '기존 클래스 이름',
                description: '기존 클래스 설명입니다.',
                imageUrl: 'https://via.placeholder.com/300x200.png?text=Original+Image',
                joinCode: 'CODE123',
                isCodeEnabled: true,
            };
            setName(dummyData.name);
            setDescription(dummyData.description);
            setImageUrl(dummyData.imageUrl);
            setJoinCode(dummyData.joinCode);
            setIsCodeEnabled(dummyData.isCodeEnabled);
            setImagePreview(dummyData.imageUrl);
        }
    }, [isEdit, classId]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const classData = { name, description, imageUrl, joinCode: isCodeEnabled ? joinCode : null };
        
        if (isEdit) {
            console.log('클래스 수정:', classData);
        } else {
            console.log('클래스 등록:', classData);
        }

        navigate('/community/ckclass/'); 
    };

    const handleDelete = () => {
        if (window.confirm('정말로 이 클래스를 삭제하시겠습니까?')) {
            console.log('클래스 삭제:', classId);
            navigate('/community/ckclass/');
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