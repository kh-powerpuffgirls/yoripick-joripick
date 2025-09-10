import useInput from '../../hooks/useInput';
import { useEffect, useState } from 'react';
import type { NutrientData } from '../../components/Mealplan/mealplanNut';
import NutrientInfo from '../../components/Mealplan/mealplanNut';
import style from './main.module.css';
import LineChart from '../../components/Mealplan/lineChar';
import MealInputModal from '../../components/Mealplan/mealInputModal';
import type { MealItemData } from '../../api/mealplanApi';

interface MockNutrients {
    [key: string]: NutrientData
}

interface MealSection {
    id: 'BRK' | 'LNC' | 'SNK' | 'DIN' | 'MNS';
    name: string;
    isExpanded: boolean;
    items: MealItemData[];
}

const mockNutrients: MockNutrients = {
    '2025-09-08': { carbs: 150, protein: 45, fat: 50, sodium: 1500, calories: 1800 },
    '2025-09-09': { carbs: 200, protein: 60, fat: 55, sodium: 1800, calories: 2200 },
    '2025-09-10': { carbs: 250, protein: 70, fat: 65, sodium: 2100, calories: 2400 },
    '2025-09-11': { carbs: 180, protein: 55, fat: 40, sodium: 1600, calories: 1900 },
};
const days = ["일", "월", "화", "수", "목", "금", "토"];

export const formatToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const nutrientLabels = {
    calories: '총 섭취량',
    carbs: '탄수화물',
    protein: '단백질',
    fat: '지방',
    sodium: '나트륨'
};

export const MealplanMain = () => {
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

    const [selectedNutrients, setSelectedNutrients] = useState<string[]>(['calories']);
    const [dailyNutrients, setDailyNutrients] = useState({
        carbs: 0,
        protein: 0,
        fat: 0,
        sodium: 0,
        calories: 0,
    });

    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    const [chartInput, handleChartInputChange] = useInput({
        fromDate: formatToYYYYMMDD(oneWeekAgo),
        toDate: formatToYYYYMMDD(today),
    });

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

    useEffect(() => {
        const selectedDate = new Date(input.year, input.month - 1, input.day);
        const dateKey = formatToYYYYMMDD(selectedDate);
        const data = mockNutrients[dateKey] || { carbs: 0, protein: 0, fat: 0, sodium: 0, calories: 0 };
        setDailyNutrients(data);
    }, [input]);

    const handleNutrientCheckbox = (nutrient: string) => {
        setSelectedNutrients(prev =>
            prev.includes(nutrient) ? prev.filter(n => n !== nutrient) : [...prev, nutrient]
        );
    };

    const toggleMealSection = (id: string) => {
        setMealList(mealList.map(meal =>
            meal.id === id ? { ...meal, isExpanded: !meal.isExpanded } : meal
        ));
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<{ mealId: string; mealName: string } | null>(null);

    const openModal = (meal: MealSection) => {
        setSelectedMeal({ mealId: meal.id, mealName: meal.name });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMeal(null);
    };

    const addMealItem = (mealId: string, newItem: MealItemData) => {
        setMealList(mealList.map(meal => {
            if (meal.id === mealId) {
                const newItems = [...meal.items, newItem];
                return { ...meal, items: newItems };
            }
            return meal;
        }));
    };

    const removeMealItem = (mealId: string, itemIndex: number) => {
        setMealList(mealList.map(meal => {
            if (meal.id === mealId) {
                const newItems = meal.items.filter((_, index) => index !== itemIndex);
                return { ...meal, items: newItems };
            }
            return meal;
        }));
    };

    const calculateDailyNutrients = () => {
        let totalCalories = 0;
        let totalCarbs = 0;
        let totalProtein = 0;
        let totalFat = 0;
        let totalSodium = 0;

        mealList.forEach(meal => {
            meal.items.forEach(item => {
                totalCalories += item.energy;
            });
        });

        const mockData = mockNutrients[formatToYYYYMMDD(new Date(input.year, input.month - 1, input.day))] || { carbs: 0, protein: 0, fat: 0, sodium: 0, calories: 0 };
        setDailyNutrients({
            ...mockData,
            calories: totalCalories
        });
    };

    useEffect(() => {
        calculateDailyNutrients();
    }, [mealList]);

    return (
        <div className={style.mealplanContainer}>
            <h2 className={style.dailyRecordHeader}>DAILY RECORD 📝</h2>
            <hr className={style.divider} />
            <div className={style.dailyRecordComponent}>
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
                <div className={style.mealListSection}>
                    {mealList.map(meal => (
                        <div key={meal.id} className={style.mealSectionItem}>
                            <div className={style.mealHeader} onClick={() => toggleMealSection(meal.id)}>
                                <div>{meal.name}</div>
                                <div className={style.mealStats}>
                                    <span>{meal.items.length}개 항목</span> / <span>{meal.items.reduce((total, item) => total + item.energy, 0)} 칼로리</span>
                                    <button className={style.addButton} onClick={(e) => { e.stopPropagation(); openModal(meal); }}>+</button>
                                </div>
                            </div>
                            {meal.isExpanded && (
                                <div className={style.mealItemsContainer}>
                                    {meal.items.length > 0 ? (
                                        meal.items.map((item, index) => (
                                            <div key={index} className={style.mealItemEntry}>
                                                <span>{item.foodName}</span>
                                                <span>{item.energy} 칼로리</span>
                                                <button className={style.removeButton} onClick={() => removeMealItem(meal.id, index)}>X</button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={style.emptyMessage}>아직 식단이 없어요.</div>
                                    )}
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
                        addMealItem={addMealItem}
                    />
                )}
            </div>
            <h2 className={style.statisticsHeader}>STATISTICS 📊</h2>
            <hr className={style.divider} />
            <div className={style.statisticsContainer}>
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
                        mockNutrients={mockNutrients}
                    />
                </div>
            </div>
        </div>
    )
}