import { useEffect, useState } from "react";
import { getChallengeImg } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

interface Challenge {
    title: string;
    imageUrl: string;
}

const TodayBanner = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [dontShowToday, setDontShowToday] = useState(false);
    const [challenge, setChallenge] = useState<Challenge>();
    const navigate = useNavigate();

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        const hideDate = localStorage.getItem("hideBannerDate");
        if (hideDate !== today) {
            getChallengeImg().then((res) => {
                setChallenge(res);
                setIsOpen(true);
            }).catch(() => {
                setIsOpen(false);
            });
        }
    }, []);

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (dontShowToday) {
            const today = new Date().toISOString().slice(0, 10);
            localStorage.setItem("hideBannerDate", today);
        }
        setIsOpen(false);
    };

    const handleBannerClick = () => {
        navigate("/community/challenge");
    };

    if (!isOpen) return null;

    return (
        <div style={styles.banner}>
            <div style={styles.title}>
                <h3>🎉 오늘의 챌린지</h3>
                <p style={styles.challengeTitle}>{challenge?.title}</p>
            </div>

            <div style={styles.imageWrapper}>
                <img
                    src={challenge?.imageUrl}
                    alt={challenge?.imageUrl}
                    style={styles.image}
                    onClick={handleBannerClick}
                />
            </div>

            <div style={styles.footer}>
                <label style={styles.checkbox}>
                    <input
                        type="checkbox"
                        checked={dontShowToday}
                        onChange={(e) => {
                            e.stopPropagation();
                            setDontShowToday(e.target.checked);
                        }}
                        style={styles.checkboxInput}
                    />
                    오늘 하루 보지 않기
                </label>
                <button onClick={(e) => handleClose(e)} style={styles.closeBtn}>
                    ✖
                </button>
            </div>
        </div>
    );
};

const styles = {
    banner: {
        position: "fixed" as const,
        top: "14%",
        left: "2%",
        width: "30%",
        backgroundColor: "#fff",
        padding: "10px",
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        borderRadius: "10px",
    },
    title: {
        fontSize: "18px",
        marginTop: "10px",
        marginLeft: "10px",
        marginRight: "10px",
        marginBottom: "20px",
        display: "flex",
        width: "100%",
        alignItems: "baseline",
    },
    challengeTitle: {
        fontSize: "16px",
        color: "#666",
        marginLeft: "10px",
    },
    imageWrapper: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "10px",
        width: "100%",
    },
    image: {
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "cover" as const,
        borderRadius: "8px",
        cursor: "pointer",
    },
    footer: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    checkbox: {
        fontSize: "14px",
    },
    checkboxInput: {
        marginRight: "5px",
    },
    closeBtn: {
        background: "transparent",
        border: "none",
        fontSize: "20px",
        cursor: "pointer",
    },
};

export default TodayBanner;
