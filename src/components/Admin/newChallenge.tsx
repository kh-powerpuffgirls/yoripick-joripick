import { newChallenge } from "../../api/adminApi";
import style from "./newChallenge.module.css"
import { useState } from "react";

interface NewChallengeProps {
    setOpenNewCh: (open: boolean) => void;
    initialData?: {
        title: string;
    } | null;
}

export const NewChallenge = ({ setOpenNewCh, initialData }: NewChallengeProps) => {
    const [title, setTitle] = useState(initialData?.title || "");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (startDate && endDate && startDate > endDate) {
            alert("종료일은 시작일보다 빠를 수 없습니다.");
            return;
        }
        const formData = new FormData();
        formData.append("title", title);
        formData.append("startDate", startDate);
        formData.append("endDate", endDate);
        if (image) {
            formData.append("upfile", image);
        }
        try {
            await newChallenge(formData);
            alert('챌린지가 성공적으로 등록되었습니다.');
        } catch {
            alert('새 챌린지 등록 중 오류가 발생했습니다.');
        }
        setOpenNewCh(false);
    };

    return (
        <div className={style.overlay}>
            <form className={style.modal} onSubmit={handleSubmit}>
                <div className={style.header}>
                    <h3>NEW CHALLENGE</h3>
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
                    <div className={style.fileInputGroup}>
                        <label>이미지 첨부</label><br />
                        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} required />
                    </div>
                </div>
                <div className={style.footer}>
                    <button className={style.submit} type="submit">등록</button>
                    <button className={style.cancel} onClick={() => setOpenNewCh(false)}>취소</button>
                </div>
            </form>
        </div>
    );
}