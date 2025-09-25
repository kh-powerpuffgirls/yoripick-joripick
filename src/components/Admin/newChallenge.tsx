import { editChallenge, newChallenge } from "../../api/adminApi";
import type { ChallengeInfo } from "../../pages/Admin/clngManagement";
import style from "./newChallenge.module.css"
import { useEffect, useState } from "react";

export interface Challenge {
    chInfoNo?: number;
    title: string;
    startDate: string;
    endDate: string;
    imageUrl?: string;
}

interface NewChallengeProps {
    setOpenNewCh: (open: boolean) => void;
    currentChallenge?: Challenge | ChallengeInfo | null;
    onSuccess: () => void;
}

export const NewChallenge = ({ setOpenNewCh, currentChallenge, onSuccess }: NewChallengeProps) => {
    const [title, setTitle] = useState(currentChallenge?.title || "");
    const [startDate, setStartDate] = useState(currentChallenge?.startDate.substring(0, 10) || "");
    const [endDate, setEndDate] = useState(currentChallenge?.endDate.substring(0, 10) || "");
    const [image, setImage] = useState<File | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(currentChallenge?.imageUrl || null);

    useEffect(() => {
        if (currentChallenge) {
            setTitle(currentChallenge.title);
            setStartDate(currentChallenge.startDate.substring(0, 10));
            setEndDate(currentChallenge.endDate.substring(0, 10));
            setPreviewImageUrl(currentChallenge.imageUrl || null);
        }
    }, [currentChallenge]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImage(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImageUrl(currentChallenge?.imageUrl || null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (startDate && endDate && startDate > endDate) {
            alert("종료일은 시작일보다 빠를 수 없습니다.");
            return;
        }
        const isEditing = !!currentChallenge;
        const formData = new FormData();
        formData.append("title", title);
        formData.append("startDate", startDate);
        formData.append("endDate", endDate);
        if (image) {
            formData.append("upfile", image);
        }
        try {
            if (isEditing && currentChallenge?.chInfoNo) {
                formData.append("chInfoNo", currentChallenge.chInfoNo.toString());
                await editChallenge(formData);
                alert('챌린지가 성공적으로 수정되었습니다.');
            } else {
                await newChallenge(formData);
                alert('챌린지가 성공적으로 등록되었습니다.');
            }
            onSuccess();
        } catch (error) {
            console.error("Challenge submission error:", error);
            alert('처리 중 오류가 발생했습니다.');
        } finally {
            setOpenNewCh(false);
        }
    };

    return (
        <div className={style.overlay}>
            <form className={style.modal} onSubmit={handleSubmit}>
                <div className={style.header}>
                    <h3>{currentChallenge ? "EDIT CHALLENGE" : "NEW CHALLENGE"}</h3>
                </div>
                <div className={style.body}>
                    <label>
                        챌린지 제목<br />
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </label>
                    <label>
                        챌린지 기간<br />
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                        -
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                    </label>
                    <div>
                        <label>이미지 첨부</label><br />
                        <div className={style.imageUploadContainer}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                required={!currentChallenge}
                            />
                            {previewImageUrl && (
                                <img src={previewImageUrl} alt="Preview" className={style.previewImage} />
                            )}
                        </div>
                    </div>
                </div>
                <div className={style.footer}>
                    <button className={style.submit} type="submit">{currentChallenge ? "수정" : "등록"}</button>
                    <button className={style.cancel} onClick={() => setOpenNewCh(false)}>취소</button>
                </div>
            </form>
        </div>
    );
}