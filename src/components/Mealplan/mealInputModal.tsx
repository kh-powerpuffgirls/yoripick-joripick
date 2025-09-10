import React, { useState, useEffect } from 'react';
import { searchFoods, type MealItemData } from '../../api/mealplanApi';
import style from './MealInputModal.module.css';
import { formatToYYYYMMDD } from '../../pages/Mealplan/main';

interface MealInputModalProps {
    closeModal: () => void;
    mealId: string;
    mealName: string;
    selectedDate: Date;
    addMealItem: (mealId: string, item: MealItemData) => void;
}

const mealOptions = [
    { id: 'breakfast', name: '아침 식사' },
    { id: 'lunch', name: '점심 식사' },
    { id: 'snack', name: '간식' },
    { id: 'dinner', name: '저녁 식사' },
    { id: 'midnightSnack', name: '야식' },
];

const MealInputModal = ({ closeModal, mealId, selectedDate, addMealItem }: MealInputModalProps) => {
    const [modalDate, setModalDate] = useState(formatToYYYYMMDD(selectedDate));
    const [foodName, setFoodName] = useState('');
    const [tab, setTab] = useState('search');
    const [selectedMealId, setSelectedMealId] = useState(mealId);

    const [searchResults, setSearchResults] = useState<MealItemData[]>([]);

    useEffect(() => {
        setModalDate(formatToYYYYMMDD(selectedDate));
    }, [selectedDate]);

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setFoodName(query);

        if (query.trim() === '') {
            setSearchResults([]);
            return;
        }

        try {
            const data = await searchFoods({query: query, foodCode: 1});
            setSearchResults(data);
        } catch (error) {
            console.error("Failed to fetch search results:", error);
            setSearchResults([]);
        }
    };

    const handleAddClick = (item: MealItemData) => {
        addMealItem(selectedMealId, item);
        closeModal();
    };

    return (
        <div className={style.modalOverlay} onClick={closeModal}>
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
                        <input
                            type="text"
                            placeholder="음식 검색"
                            value={foodName}
                            onChange={handleSearchChange}
                            className={style.searchInput}
                        />
                    </div>
                )}

                <div className={style.tabContent}>
                    {tab === 'search' && (
                        <div className={style.foodList}>
                            {searchResults.length > 0 ? (
                                searchResults.map((food, index) => (
                                    <div key={index} className={style.foodItem}>
                                        <span>{food.foodName}</span>
                                        <span>{food.energy} kcal</span>
                                        <button onClick={() => handleAddClick(food)}>추가</button>
                                    </div>
                                ))
                            ) : (
                                <div className={style.emptyMessage}>검색 결과가 없어요.</div>
                            )}
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
        </div>
    );
};

export default MealInputModal;
