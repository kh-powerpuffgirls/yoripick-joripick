import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MarketBuyForm.module.css';
import CommunityHeader from '../CommunityHeader';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';

// API 응답 데이터 타입 정의 (백엔드와 일치하도록 수정)
interface MarketItem {
    productId: number;
    title: string;
    detail: string;
    image: string;
    name: string;
    price: number;
    quantity: number;
}

const MarketBuyForm = () => {
    // URL 파라미터에서 productId를 가져옵니다.
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const isLoggedIn = !!accessToken;

    const [item, setItem] = useState<MarketItem | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [buyerName, setBuyerName] = useState('');
    const [buyerPhone, setBuyerPhone] = useState('');
    const [error, setError] = useState<string | null>(null);

    // 로그인 여부 확인 및 리디렉션
    useEffect(() => {
        if (!isLoggedIn) {
            alert('로그인이 필요합니다.');
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    // 게시글 정보 불러오기
    useEffect(() => {
            const fetchItem = async () => {
                if (!id) {
                    setError('게시글 ID가 유효하지 않습니다.');
                    return;
                }
                try {
                    const response = await axios.get(`http://localhost:8081/community/market/${id}`);
                    setItem(response.data);
                } catch (err) {
                    console.error("Failed to fetch item details:", err);
                    setError('상품 정보를 불러오는데 실패했습니다.');
                    setItem(null);
                }
            };
            fetchItem();
        }, [id]);

    const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setQuantity(Number(e.target.value));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isLoggedIn || !accessToken) {
            setError('로그인 상태가 유효하지 않습니다. 다시 로그인해주세요.');
            return;
        }

        if (!buyerName || !buyerPhone) {
            setError('이름과 연락처를 모두 입력해주세요.');
            return;
        }

        if (!id) {
            setError('게시글 ID가 유효하지 않습니다.');
            return;
        }

        const buyData = {
            productId: Number(id),
            quantity,
            buyerName,
            buyerPhone,
        };

        try {
            await axios.post('http://localhost:8081/community/market/buy', buyData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            });
            alert(`${item?.name || '상품'} ${quantity}개 구매 신청이 완료되었습니다.`);
            navigate('/community/market');
        } catch (err) {
            const axiosError = err as AxiosError;
            console.error("Failed to submit buy form:", axiosError.response || axiosError);
            if (axiosError.response?.status === 401) {
                setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
            } else {
                setError('구매 신청에 실패했습니다.');
            }
        }
    };

    if (error) {
        return <div className={styles.loading}>{error}</div>;
    }

    if (!item) {
        return <div className={styles.loading}>상품 정보를 불러오는 중입니다...</div>;
    }

    const stockOptions = Array.from({ length: item.quantity }, (_, i) => i + 1);

    return (
        <>
            <CommunityHeader/>
            <div className={styles.container}>
                <div className={styles.formContainer}>
                    <h1 className={styles.title}>구매 폼 작성</h1>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.section}>
                            <div className={styles.itemInfo}>
                                <img src={item.image} alt={item.name} className={styles.itemImage} />
                                <div className={styles.itemDetails}>
                                    <span className={styles.itemTitle}>{item.name}</span>
                                    <span className={styles.itemPrice}>가격: {item.price.toLocaleString()}원</span>
                                    <span className={styles.itemStock}>재고: {item.quantity}개</span>
                                </div>
                            </div>
                            <div className={styles.itemDescription}>
                                <h2>상세 설명</h2>
                                <p>{item.detail}</p>
                            </div>
                        </div>
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>구매 정보</h2>
                            {error && <div className={styles.errorBox}>{error}</div>}
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>수량</label>
                                <select className={styles.selectInput} value={quantity} onChange={handleQuantityChange}>
                                    {stockOptions.map(num => (
                                        <option key={num} value={num}>{num}개</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>연락처</label>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    placeholder="연락 가능한 전화번호를 입력해주세요"
                                    value={buyerPhone}
                                    onChange={(e) => setBuyerPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>이름</label>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    placeholder="이름을 입력해주세요"
                                    value={buyerName}
                                    onChange={(e) => setBuyerName(e.target.value)}
                                    required
                                />
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