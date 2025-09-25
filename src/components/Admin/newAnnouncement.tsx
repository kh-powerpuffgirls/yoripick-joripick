import { useEffect, useState } from "react";
import style from "./newAnnouncement.module.css"
import { editAnnouncement, newAnnouncement } from "../../api/adminApi";

interface NewAnnouncementProps {
    setOpenNewAnn: (open: boolean) => void;
    currentAnnouncement?: Announcement | null;
    onSuccess: () => void;
}

export interface Announcement {
    ancmtNo?: number;
    content: string;
    startDate: string;
    endDate: string;
}

export const NewAnnouncement = ({ setOpenNewAnn, currentAnnouncement, onSuccess }: NewAnnouncementProps) => {
    const [content, setContent] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if (currentAnnouncement) {
            setContent(currentAnnouncement.content);
            setStartDate(currentAnnouncement.startDate.substring(0, 10));
            setEndDate(currentAnnouncement.endDate.substring(0, 10));
        }
    }, [currentAnnouncement]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (startDate && endDate && startDate > endDate) {
            alert("종료일은 시작일보다 빠를 수 없습니다.");
            return;
        }
        const isEditing = !!currentAnnouncement;
        const announcementData: Announcement = {
            content,
            startDate,
            endDate,
        };
        try {
            if (isEditing) {
                await editAnnouncement({ ...announcementData, ancmtNo: currentAnnouncement.ancmtNo });
                alert('공지사항이 성공적으로 수정되었습니다.');
            } else {
                await newAnnouncement(announcementData);
                alert('공지사항이 성공적으로 등록되었습니다.');
            }
            onSuccess();
        } catch {
            alert('처리 중 오류가 발생했습니다.');
        }
        setOpenNewAnn(false);
    };

    return (
        <div className={style.overlay}>
            <form className={style.modal} onSubmit={handleSubmit}>
                <div className={style.header}>
                    <h3>{currentAnnouncement ? "EDIT ANNOUNCEMENT" : "NEW ANNOUNCEMENT"}</h3>
                </div>
                <div className={style.body}>
                    <label>
                        공지 기간<br />
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                        -
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                    </label>
                    <label>
                        공지 내용
                        <textarea value={content} onChange={(e) => setContent(e.target.value)}
                            placeholder="공지 내용을 입력해주세요." required />
                    </label>
                </div>
                <div className={style.footer}>
                    <button className={style.submit} type="submit">{currentAnnouncement ? "수정" : "공지"}</button>
                    <button className={style.cancel} onClick={() => setOpenNewAnn(false)}>취소</button>
                </div>
            </form>
        </div>
    );
}