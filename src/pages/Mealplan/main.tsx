import useInput from '../../hooks/useInput';
import { useEffect, useMemo, useState } from 'react';
import NutrientInfo, { type NutrientData } from '../../components/Mealplan/mealplanNut';
import style from './main.module.css';
import LineChart, { nutrientLabels } from '../../components/Mealplan/lineChar';
import MealInputModal from '../../components/Mealplan/mealInputModal';
import { fetchMealList, fetchMealStats, removeMealItem, type MealItemData } from '../../api/mealplanApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import alertStyle from '../../components/Mealplan/mealplanAlert.module.css'

interface MealSection {
    id: 'BRK' | 'LNC' | 'SNK' | 'DIN' | 'MNS';
    name: string;
    isExpanded: boolean;
    items: MealItemData[];
}

const days = ["일", "월", "화", "수", "목", "금", "토"];

export const formatToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const MealplanMain = () => {
    const userNo = useSelector((state: RootState) => state.auth.user?.userNo);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const showAlert = (message: string) => setAlertMessage(message);

    const [input, handleInputChange, resetInput, setInput] = useInput({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate()
    });

    const [mealList, setMealList] = useState<MealSection[]>([
        { id: 'BRK', name: '아침 식사', isExpanded: false, items: [] },
        { id: 'LNC', name: '점심 식사', isExpanded: false, items: [] },
        { id: 'SNK', name: '간식', isExpanded: false, items: [] },
        { id: 'DIN', name: '저녁 식사', isExpanded: false, items: [] },
        { id: 'MNS', name: '야식', isExpanded: false, items: [] }
    ]);
    const years = Array.from({ length: 10 }, (_, i) => input.year - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const [dailyNutrients, setDailyNutrients] = useState<NutrientData>({
        carbs: 0,
        protein: 0,
        fat: 0,
        sodium: 0,
        energy: 0,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<{ mealId: string; mealName: string } | null>(null);
    const [selectedNutrients, setSelectedNutrients] = useState<string[]>(['energy']);
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    const [chartInput, handleChartInputChange] = useInput({
        fromDate: formatToYYYYMMDD(oneWeekAgo),
        toDate: formatToYYYYMMDD(today),
    });

    const [statistics, setStatistics] = useState<Record<string, NutrientData>>({});
    const dateKey = useMemo(() => formatToYYYYMMDD(new Date(input.year, input.month - 1, input.day)), [input]);

    const generateDates = () => {
        const dates = [];
        const date = new Date(input.year, input.month - 1, input.day);
        for (let i = -3; i <= 3; i++) {
            const d = new Date(date);
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    };
    const dateCards = generateDates();

    // daily meal fetch
    const loadMeals = async () => {
        if (!userNo) return;
        try {
            const data = await fetchMealList(userNo, dateKey);
            setMealList(prev =>
                prev.map(meal => ({
                    ...meal,
                    items: data[meal.id] || [],
                }))
            );
        } catch (err) {
            console.error("식단 불러오기 실패:", err);
        }
    };
    useEffect(() => {
        loadMeals();
    }, [dateKey, userNo]);

    // dailyNutrients 계산
    useEffect(() => {
        const totals = mealList.reduce(
            (acc, meal) => {
                meal.items.forEach(item => {
                    const factor = (item.quantity ?? 100) / 100;
                    acc.energy += (item.energy ?? 0) * factor;
                    acc.carbs += (item.carb ?? 0) * factor;
                    acc.protein += (item.protein ?? 0) * factor;
                    acc.fat += (item.fat ?? 0) * factor;
                    acc.sodium += (item.sodium ?? 0) * factor;
                });
                return acc;
            },
            { energy: 0, carbs: 0, protein: 0, fat: 0, sodium: 0 }
        );
        setDailyNutrients(totals);
    }, [mealList]);

    // 통계 데이터 fetch
    const loadSummary = async () => {
        if (!userNo) return;
        try {
            const data = await fetchMealStats(chartInput.fromDate, chartInput.toDate, userNo);
            setStatistics(data);
        } catch (err) {
            console.error("일별 합계 가져오기 실패:", err);
        }
    };
    useEffect(() => {
        loadSummary();
    }, [userNo, chartInput]);

    const toggleMealSection = (id: string) => {
        setMealList(mealList.map(meal =>
            meal.id === id ? { ...meal, isExpanded: !meal.isExpanded } : meal
        ));
    };

    const openModal = (meal: MealSection) => {
        setSelectedMeal({ mealId: meal.id, mealName: meal.name });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMeal(null);
    };

    const handleDeleteMealItem = async (mealNo: number) => {
        try {
            await removeMealItem(mealNo);
            await loadMeals();
            await loadSummary();
            showAlert('식단을 삭제했습니다.');
        } catch (err) {
            showAlert('삭제에 실패했습니다.');
        }
    };

    const handleNutrientCheckbox = (nutrient: string) => {
        setSelectedNutrients(prev =>
            prev.includes(nutrient) ? prev.filter(n => n !== nutrient) : [...prev, nutrient]
        );
    };

    return (
        <div className={style.mealplanContainer}>
            {/* Daily Record */}
            <h2 className={style.dailyRecordHeader}>DAILY RECORD 📝</h2>
            <hr className={style.divider} />
            <div className={style.dailyRecordComponent}>
                {/* 날짜 선택 UI */}
                <div className={style.nutrientSection}>
                    <div className={style.dropdownContainer}>
                        <select name="year" value={input.year} onChange={handleInputChange}>
                            {years.map(y => (<option key={y} value={y}>{y} 년</option>))}
                        </select>
                        <select name="month" value={input.month} onChange={handleInputChange}>
                            {months.map(m => (<option key={m} value={m}>{m} 월</option>))}
                        </select>
                    </div>
                    <div className={style.dateCardsContainer}>
                        {dateCards.map((date) => (
                            <button
                                key={date.getTime()}
                                className={`${style.dateCard} ${date.getDate() === input.day ? style.selected : ''}`}
                                onClick={() => setInput({ ...input, day: date.getDate() })}
                                style={{
                                    color: date.getDay() === 0 ? 'red' : (date.getDay() === 6 ? 'blue' : 'black')
                                }}>
                                {days[date.getDay()]}<br />{date.getDate()}
                            </button>
                        ))}
                    </div>
                    <NutrientInfo nutrients={dailyNutrients} />
                </div>

                {/* Meal List */}
                <div className={style.mealListSection}>
                    {mealList.map(meal => (
                        <div key={meal.id} className={style.mealSectionItem}>
                            <div className={style.mealHeader} onClick={() => toggleMealSection(meal.id)}>
                                <div style={{ fontWeight: "bold" }}>{meal.name}</div>
                                <div className={style.mealStats}>
                                    <span>{meal.items.length}개 항목</span> /
                                    <span>
                                        {Math.round(
                                            meal.items.reduce((total, item) => {
                                                const factor = (item.quantity ?? 100) / 100;
                                                return total + (item.energy ?? 0) * factor;
                                            }, 0)
                                        )} 칼로리
                                    </span>
                                    <button className={style.addButton} onClick={(e) => { e.stopPropagation(); openModal(meal); }}>+</button>
                                </div>
                            </div>
                            {meal.isExpanded && meal.items.length > 0 && (
                                <div className={style.mealItemsContainer}>
                                    {meal.items.map((item, index) => (
                                        <div key={index} className={style.mealItemEntry}>
                                            <span className={style.mealItemLeft}>{item.foodName} ({item.quantity ?? 100}g)</span>
                                            <div className={style.mealItemRight}>
                                                <span className={style.mealItemEnergy}>{Math.round((item.energy ?? 0) * ((item.quantity ?? 100) / 100))} 칼로리</span>
                                                <button className={style.removeButton} onClick={() => handleDeleteMealItem(item.mealNo)}>X</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {isModalOpen && selectedMeal && (
                    <MealInputModal
                        closeModal={closeModal}
                        mealId={selectedMeal.mealId}
                        mealName={selectedMeal.mealName}
                        selectedDate={new Date(input.year, input.month - 1, input.day)}
                        showAlert={showAlert}
                        refreshMeals={loadMeals}
                        refreshSummary={loadSummary}
                    />
                )}
            </div>

            {/* Statistics */}
            <h2 className={style.statisticsHeader}>STATISTICS 📊</h2>
            <hr className={style.divider} />
            <div className={style.statisticsContainer}>
                {/* 날짜 범위 선택 & 체크박스 */}
                <div className={style.statisticsFilterArea}>
                    <div className={style.dateRangeSelector}>
                        <div className={style.dateSelectorRow}>
                            <span className={style.dateLabel}>FROM</span>
                            <input type="date" name="fromDate" className={style.dateInput}
                                value={chartInput.fromDate} onChange={handleChartInputChange} />
                        </div>
                        <div className={style.dateSelectorRow}>
                            <span className={style.dateLabel}>TO</span>
                            <input type="date" name="toDate" className={style.dateInput}
                                value={chartInput.toDate} onChange={handleChartInputChange} />
                        </div>
                    </div>
                    <div className={style.checkboxList}>
                        {Object.keys(nutrientLabels).map(nutrient => (
                            <div key={nutrient} className={style.checkboxItem}>
                                <input
                                    type="checkbox"
                                    id={nutrient}
                                    className={style.nutrientCheckbox}
                                    checked={selectedNutrients.includes(nutrient)}
                                    onChange={() => handleNutrientCheckbox(nutrient)}
                                />
                                <label htmlFor={nutrient} className={style.checkboxLabel}>
                                    {nutrientLabels[nutrient as keyof typeof nutrientLabels]}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={style.statisticsChartArea}>
                    <LineChart
                        fromDate={chartInput.fromDate}
                        toDate={chartInput.toDate}
                        selectedNutrients={selectedNutrients}
                        statistics={statistics}
                    />
                </div>
            </div>

            {alertMessage && (
                <div className={alertStyle.modalBackdrop} onClick={() => setAlertMessage(null)}>
                    <div className={alertStyle.modal}>
                        <h3>{alertMessage}</h3>
                        <button className={alertStyle.confirm} onClick={() => setAlertMessage(null)}>확인</button>
                    </div>
                </div>
            )}
        </div>
    )
}