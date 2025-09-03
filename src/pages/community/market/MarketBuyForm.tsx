// MarketBuyForm.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MarketBuyForm.module.css';
import CommunityHeader from '../CommunityHeader';
import axios from 'axios';

interface MarketItem {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    itemName: string;
    price: number;
    stock: number;
}

const MarketBuyForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<MarketItem | null>(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/community/market/posts/${id}`);
                setItem(response.data);
            } catch (error) {
                console.error("Failed to fetch item details:", error);
                setItem(null);
            }
        };
        fetchItem();
    }, [id]);

    const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setQuantity(Number(e.target.value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 구매 신청 로직 (API 호출 등)
        alert(`${item?.itemName} ${quantity}개 구매 신청이 완료되었습니다.`);
        navigate('/community/market');
    };

    if (!item) {
        return <div className={styles.loading}>상품 정보를 불러오는 중입니다...</div>;
    }

    return (
        <>
            <CommunityHeader/>
            <div className={styles.container}>
                <div className={styles.formContainer}>
                    <h1 className={styles.title}>구매 폼 작성</h1>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.section}>
                            <div className={styles.itemInfo}>
                                <img src={item.imageUrl} alt={item.itemName} className={styles.itemImage} />
                                <div className={styles.itemDetails}>
                                    <span className={styles.itemTitle}>{item.itemName}</span>
                                    <span className={styles.itemPrice}>가격: {item.price.toLocaleString()}원</span>
                                    <span className={styles.itemStock}>재고: {item.stock}개</span>
                                </div>
                            </div>
                            <div className={styles.itemDescription}>
                                <h2>상세 설명</h2>
                                <p>{item.description}</p>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>구매 정보</h2>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>수량</label>
                                <select className={styles.selectInput} value={quantity} onChange={handleQuantityChange}>
                                    {Array.from({ length: item.stock }, (_, i) => i + 1).map(num => (
                                        <option key={num} value={num}>{num}개</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>연락처</label>
                                <input type="text" className={styles.inputField} placeholder="연락 가능한 전화번호를 입력해주세요" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>이름</label>
                                <input type="text" className={styles.inputField} placeholder="이름을 입력해주세요" />
                            </div>
                        </div>

                        <div className={styles.buttonGroup}>
                            <button type="submit" className={styles.submitButton}>구매 신청</button>
                            <button type="button" className={styles.cancelButton} onClick={() => navigate(-1)}>취소</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default MarketBuyForm;