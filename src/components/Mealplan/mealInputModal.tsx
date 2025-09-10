import React, { useState, useEffect, useRef } from 'react';
import { fetchFoodCodes, saveMealItem, searchFoods, type FoodCodeData, type MealItemData } from '../../api/mealplanApi';
import style from './MealInputModal.module.css';
import { formatToYYYYMMDD } from '../../pages/Mealplan/main';
import type { RootState } from '../../store/store';
import { useSelector } from 'react-redux';

type MealItemWithWeight = MealItemData & { weight: number };

interface MealInputModalProps {
    closeModal: () => void;
    mealId: string;
    mealName: string;
    selectedDate: Date;
    addMealItem: (mealId: string, item: MealItemData) => void;
}

const mealOptions = [
    { id: 'BRK', name: '아침 식사' },
    { id: 'LNC', name: '점심 식사' },
    { id: 'SNK', name: '간식' },
    { id: 'DIN', name: '저녁 식사' },
    { id: 'MNS', name: '야식' },
];

const MealInputModal = ({ closeModal, mealId, selectedDate, addMealItem }: MealInputModalProps) => {
    const userNo = useSelector((state: RootState) => state.auth.user?.userNo);
    const [modalDate, setModalDate] = useState(formatToYYYYMMDD(selectedDate));
    const [tab, setTab] = useState('search');
    const [selectedMealId, setSelectedMealId] = useState(mealId);
    const [searchResults, setSearchResults] = useState<MealItemData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const foodNameInputRef = useRef('');
    const [selectedFoodCode, setSelectedFoodCode] = useState<number | null>(0);
    const [foodCodeOptions, setFoodCodeOptions] = useState<FoodCodeData[]>([]);
    const [itemWeights, setItemWeights] = useState<Record<number, number>>({});

    useEffect(() => {
        setModalDate(formatToYYYYMMDD(selectedDate));
    }, [selectedDate]);

    useEffect(() => {
        const getFoodCodes = async () => {
            try {
                const data = await fetchFoodCodes();
                setFoodCodeOptions([{ foodCode: 0, foodCodeName: '전체' }, ...data]);
            } catch (error) {
                console.error("Failed to fetch food codes:", error);
                setFoodCodeOptions([{ foodCode: 0, foodCodeName: '전체' }]);
            }
        };
        getFoodCodes();
    }, []);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (searchQuery === "" && selectedFoodCode === 0) {
                setSearchResults([]);
                return;
            }
            try {
                const data = await searchFoods({ query: searchQuery, foodCode: selectedFoodCode });
                setSearchResults(data);
            } catch (error) {
                console.error("Failed to fetch search results:", error);
                setSearchResults([]);
            }
        };
        fetchSearchResults();
    }, [searchQuery, selectedFoodCode]);

    const handleWeightChange = (foodId: number, weight: number) => {
        setItemWeights(prev => ({
            ...prev,
            [foodId]: weight,
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        foodNameInputRef.current = e.target.value;
    };
    const handleAddClick = async (item: MealItemData) => {
        const weight = itemWeights[item.foodNo] ?? 100;
        try {
            await saveMealItem(userNo, selectedMealId, modalDate, item, weight);
            addMealItem(selectedMealId, { ...item, weight } as MealItemWithWeight);
            closeModal();
        } catch (error) {
            console.error("DB 저장 실패:", error);
            alert("식단 추가에 실패했습니다.");
        }
    };

    return (
        <div className={style.modalOverlay}>
            <div className={style.modalContent} onClick={e => e.stopPropagation()}>
                <div className={style.modalHeader}>
                    <h2>식단 입력</h2>
                    <button className={style.closeButton} onClick={closeModal}>X</button>
                </div>

                <div className={style.inputArea}>
                    <div className={style.topControls}>
                        <div className={style.dateSelector}>
                            <input
                                type="date"
                                value={modalDate}
                                onChange={(e) => setModalDate(e.target.value)}
                            />
                            <select value={selectedMealId} onChange={(e) => setSelectedMealId(e.target.value)}>
                                {mealOptions.map(meal => (
                                    <option key={meal.id} value={meal.id}>{meal.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={style.tabs}>
                            <button onClick={() => setTab('search')} className={tab === 'search' ? style.activeTab : ''}>음식 검색</button>
                            <button onClick={() => setTab('recent')} className={tab === 'recent' ? style.activeTab : ''}>최근</button>
                            <button onClick={() => setTab('myRecipe')} className={tab === 'myRecipe' ? style.activeTab : ''}>내 레시피</button>
                        </div>
                    </div>
                </div>

                {tab === 'search' && (
                    <div className={style.searchBarContainer}>
                        <select
                            value={selectedFoodCode ?? ""}
                            onChange={(e) => {
                                const newCode = Number(e.target.value);
                                setSelectedFoodCode(newCode);
                                setSearchQuery(foodNameInputRef.current.trim());
                            }}
                            className={style.foodCodeSelect}
                        >
                            {foodCodeOptions.map(option => (
                                <option key={option.foodCode} value={option.foodCode}>
                                    {option.foodCodeName}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="검색할 음식명을 입력해주세요."
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setSearchQuery(foodNameInputRef.current);
                                }
                            }}
                            className={style.searchInput}
                        />
                        <button
                            onClick={() => setSearchQuery(foodNameInputRef.current)}
                            className={style.searchButton}
                        >
                            검색
                        </button>
                    </div>
                )}

                <div className={style.tabContent}>
                    {tab === 'search' && (
                        <div className={style.foodList}>
                            {searchResults.length > 0 ? (
                                <>
                                    <p>표시되는 칼로리는 모두 100g(ml) 기준입니다.</p>
                                    {searchResults.map((food, index) => (
                                        <div key={index} className={style.foodItem}>
                                            <span className={style.ellipsisText} title={food.foodName}>{food.foodName}</span>
                                            <span>{food.energy} kcal</span>
                                            <div className={style.inputGroup}>
                                                <input
                                                    type="number"
                                                    step="10"
                                                    min="10"
                                                    defaultValue={itemWeights[food.foodNo] ?? 100}
                                                    className={style.weightInput}
                                                    onChange={(e) =>
                                                        handleWeightChange(food.foodNo, Number(e.target.value))
                                                    }
                                                />
                                                <span>g(ml)</span>
                                                <button onClick={() => handleAddClick(food)}>추가</button>
                                            </div>
                                        </div>
                                    ))}

                                </>
                            ) : (
                                <div className={style.emptyMessage}>검색 결과가 없어요.</div>
                            )}
                        </div>
                    )}
                </div>
                {tab === 'search' && (
                    <div className={style.addManuallyPrompt}>
                        <span>찾는 음식이 없나요?</span>
                        <span
                            className={style.addManuallyLink}
                            onClick={() => setTab('manualAdd')}
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            직접 추가하기
                        </span>
                    </div>
                )}

                {tab === 'recent' && (
                    <div className={style.emptyMessage}>최근 식단이 없어요.</div>
                )}
                {tab === 'myRecipe' && (
                    <div className={style.emptyMessage}>저장된 레시피가 없어요.</div>
                )}
            </div>
        </div>
    );
};

export default MealInputModal;