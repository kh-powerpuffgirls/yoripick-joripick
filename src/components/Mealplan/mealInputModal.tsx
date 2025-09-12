import React, { useState, useEffect, useRef } from 'react';
import { addRcpItem, fetchFoodCodes, fetchRecent, fetchRecipes, saveFoodItem, saveMealItem, searchFoods, type FoodCodeData, type MealItemData } from '../../api/mealplanApi';
import style from './MealInputModal.module.css';
import { formatToYYYYMMDD } from '../../pages/Mealplan/main';
import type { RootState } from '../../store/store';
import { useSelector } from 'react-redux';

import mockImg from '../../assets/jopik.png'

interface MealInputModalProps {
    closeModal: () => void;
    mealId: string;
    mealName: string;
    selectedDate: Date;
    showAlert: (message: string) => void;
    refreshMeals: () => Promise<void>;
    refreshSummary: () => Promise<void>;
}

const mealOptions = [
    { id: 'BRK', name: '아침 식사' },
    { id: 'LNC', name: '점심 식사' },
    { id: 'SNK', name: '간식' },
    { id: 'DIN', name: '저녁 식사' },
    { id: 'MNS', name: '야식' },
];

interface RecipeType {
    rcpNo: number;
    rcpName: string;
    energy: number;
    imgUrl: string;
}

const MealInputModal = ({ closeModal, mealId, selectedDate, refreshMeals, refreshSummary, showAlert }: MealInputModalProps) => {
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
    const [recentMeals, setRecentMeals] = useState<MealItemData[]>([]);
    const [myRecipes, setMyRecipes] = useState<RecipeType[]>([]);

    const [manualFood, setManualFood] = useState<{
        mealType: "FOOD" | "RCP";
        foodName: string;
        energy: number;
        carb: number;
        protein: number;
        fat: number;
        sodium: number;
        quantity: number;
    }>({
        mealType: 'FOOD',
        foodName: '',
        energy: 0,
        carb: 0,
        protein: 0,
        fat: 0,
        sodium: 0,
        quantity: 0,
    });

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
        if (!userNo) return;
        const fetchRecentMeals = async () => {
            if (tab === 'recent') {
                try {
                    const data = await fetchRecent(userNo);
                    setRecentMeals(data);
                } catch (error) {
                    console.error('Failed to fetch recent meals:', error);
                    setRecentMeals([]);
                }
            } else if (tab === 'myRecipe') {
                try {
                    const data = await fetchRecipes(userNo);
                    setMyRecipes(data);
                } catch (error) {
                    console.error('Failed to fetch bookmarked recipes:', error);
                    setMyRecipes([]);
                }
            }

        };
        fetchRecentMeals();
    }, [tab, userNo]);

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
        item.quantity = itemWeights[item.foodNo] ?? 100;
        try {
            await saveMealItem(userNo, selectedMealId, modalDate, item);
            await refreshMeals();
            await refreshSummary();
            showAlert('식단을 추가했습니다.');
            closeModal();
        } catch (error) {
            showAlert('식단 추가에 실패했습니다.');
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualFood.foodName || manualFood.foodName.trim() == "" ||
            manualFood.quantity <= 0 || manualFood.quantity <= 0 ||
            manualFood.energy <= 0 || manualFood.carb <= 0 ||
            manualFood.fat <= 0 || manualFood.protein <= 0 || manualFood.sodium <= 0) {
            showAlert('모든 내용은 필수로 입력해주세요.');
            return;
        }
        try {
            await saveFoodItem(userNo, selectedMealId, modalDate, manualFood);
            await refreshMeals();
            await refreshSummary();
            showAlert('식단을 추가했습니다.');
            closeModal();
        } catch (error) {
            console.error(error);
            showAlert('식단 추가에 실패했습니다.');
        }
    };

    const handleAddRcp = async (rcpNo: number) => {
        try {
            await addRcpItem(userNo, selectedMealId, modalDate, rcpNo);
            await refreshMeals();
            await refreshSummary();
            showAlert('식단을 추가했습니다.');
            closeModal();
        } catch (error) {
            console.error(error);
            showAlert('식단 추가에 실패했습니다.');
        }
    }

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
                                                    min="0"
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
                    <div className={style.foodList}>
                        {recentMeals.length > 0 ? (
                            <>
                                <p>최근 저장한 식단입니다. 단위: 100g(ml) 기준</p>
                                {recentMeals.map((food, index) => (
                                    <div key={index} className={style.foodItem}>
                                        <span className={style.ellipsisText} title={food.foodName}>{food.foodName}</span>
                                        <span>{food.energy} kcal</span>
                                        <div className={style.inputGroup}>
                                            {food.mealType === 'FOOD' ? (
                                                <>
                                                    <input
                                                        type="number"
                                                        step="10"
                                                        min="10"
                                                        defaultValue={itemWeights[food.foodNo] ?? food.quantity}
                                                        className={style.weightInput}
                                                        onChange={(e) =>
                                                            handleWeightChange(food.foodNo, Number(e.target.value))
                                                        }
                                                    />
                                                    <span>g(ml)</span>
                                                </>
                                            ) : (
                                                <>
                                                    <input className={style.weightInput} disabled style={{ visibility: "hidden" }} />
                                                    <span style={{ color: "transparent" }}>g(ml)</span>
                                                </>
                                            )}
                                            <button onClick={() => handleAddClick(food)}>
                                                추가
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className={style.emptyMessage}>최근 식단이 없어요.</div>
                        )}
                    </div>
                )}

                {tab === 'myRecipe' && (
                    <div className={style.recipeList}>
                        {myRecipes.length > 0 ? (
                            <>
                                {myRecipes.map((recipe, index) => (
                                    <div key={index} className={style.recipeCard}>
                                        {/* <img src={recipe.imgUrl} alt={recipe.rcpName}/> */}
                                        <img src={mockImg} alt={recipe.rcpName} />
                                        <h3>{recipe.rcpName}</h3>
                                        <p>{recipe.energy} kcal</p>
                                        <div className={style.buttonGroup}>
                                            <button>레시피 보기</button>
                                            <button onClick={() => handleAddRcp(recipe.rcpNo)}>추가</button>
                                            <button>북마크 해제</button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className={style.emptyMessage}>저장된 레시피가 없어요.</div>
                        )}
                    </div>
                )}

                {tab === 'manualAdd' && (
                    <form className={style.manualAddForm} onSubmit={handleManualSubmit}>
                        {/* 음식명 행 */}
                        <div className={style.formRow}>
                            <label className={style.inputLabel}>음식명</label>
                            <input
                                type="text"
                                value={manualFood.foodName}
                                onChange={(e) => setManualFood({ ...manualFood, foodName: e.target.value })}
                                required
                            />
                        </div>
                        {/* 중량 & 칼로리 행 */}
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label className={style.inputLabel}>중량</label>
                                <div className={style.unitInputGroup}>
                                    <input
                                        type="number"
                                        value={manualFood.quantity}
                                        onChange={(e) => setManualFood({ ...manualFood, quantity: Number(e.target.value) })}
                                        required
                                        step="10"
                                    />
                                </div>
                            </div>
                            <div className={style.formGroup}>
                                <label className={style.inputLabel}>칼로리(kcal)</label>
                                <input
                                    type="number"
                                    value={manualFood.energy}
                                    onChange={(e) => setManualFood({ ...manualFood, energy: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                        {/* 탄수화물 & 단백질 행 */}
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label className={style.inputLabel}>탄수화물(g)</label>
                                <input
                                    type="number"
                                    value={manualFood.carb}
                                    onChange={(e) => setManualFood({ ...manualFood, carb: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className={style.formGroup}>
                                <label className={style.inputLabel}>단백질(g)</label>
                                <input
                                    type="number"
                                    value={manualFood.protein}
                                    onChange={(e) => setManualFood({ ...manualFood, protein: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                        {/* 지방 & 나트륨 행 */}
                        <div className={style.formRow}>
                            <div className={style.formGroup}>
                                <label className={style.inputLabel}>지방(g)</label>
                                <input
                                    type="number"
                                    value={manualFood.fat}
                                    onChange={(e) => setManualFood({ ...manualFood, fat: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className={style.formGroup}>
                                <label className={style.inputLabel}>나트륨(mg)</label>
                                <input
                                    type="number"
                                    value={manualFood.sodium}
                                    onChange={(e) => setManualFood({ ...manualFood, sodium: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                        <p>모든 영양성분 데이터(칼로리, 탄단지, 나트륨)는 100g(ml) 기준으로 입력해주세요.</p>
                        {/* 버튼 그룹 */}
                        <div className={style.buttonGroups}>
                            <button type="submit" className={style.addButton}>추가</button>
                            <button type="button" onClick={() => setTab('search')} className={style.cancelButton}>취소</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default MealInputModal;