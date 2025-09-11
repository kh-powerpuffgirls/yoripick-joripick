import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import type { NutrientData } from './mealplanNut';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface LineChartProps {
    fromDate: string;
    toDate: string;
    selectedNutrients: string[];
    statistics: Record<string, NutrientData>;
}

export const nutrientColors: { [key: string]: string } = {
    energy: "#FEBEA2",
    carbs: "#4F98FF",
    protein: "#FBB871",
    fat: "#9986DD",
    sodium: "#77D57A"
};

export const nutrientLabels: Record<string, string> = {
    energy: '총 섭취량',
    carbs: '탄수화물',
    protein: '단백질',
    fat: '지방',
    sodium: '나트륨'
};

export default function LineChart({selectedNutrients, statistics}: LineChartProps) {
    const labels = Object.keys(statistics).sort();
    const datasets = selectedNutrients.map((nutrient) => {
        const isCaloriesOrSodium = nutrient === 'energy' || nutrient === 'sodium';
        return {
            label: nutrientLabels[nutrient] || nutrient,
            data: labels.map((date) => statistics[date]?.[nutrient as keyof NutrientData] || 0),
            borderColor: nutrientColors[nutrient],
            backgroundColor: nutrientColors[nutrient],
            tension: 0.3,
            borderWidth: 2,
            fill: true,
            yAxisID: isCaloriesOrSodium ? 'y2' : 'y',
        }
    });

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                labels: { font: { size: 12 } }
            },
            title: {
                display: true,
                text: "나의 영양성분 그래프",
                font: { size: 16 }
            },
        },
        scales: {
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: {
                    display: true,
                    text: 'g'
                }
            },
            y2: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                title: {
                    display: true,
                    text: 'mg, kcal'
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    return (
        <div style={{ width: '650px', height: '100%' }}>
            <Line data={{ labels, datasets }} options={options} />
        </div>
    );
}