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
import { useEffect, useState } from "react";
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
    mockNutrients: { [key: string]: NutrientData };
}

export const nutrientColors: { [key: string]: string } = {
    calories: "#FEBEA2",
    carbs: "#4F98FF",
    protein: "#FBB871",
    fat: "#9986DD",
    sodium: "#77D57A"
};

const nutrientLabels: { [key: string]: string } = {
    calories: '총 섭취량',
    carbs: '탄수화물',
    protein: '단백질',
    fat: '지방',
    sodium: '나트륨'
};

export default function LineChart({
    fromDate,
    toDate,
    selectedNutrients,
    mockNutrients
}: LineChartProps) {
    const [chartData, setChartData] = useState<any[]>([]);
    const [labels, setLabels] = useState<string[]>([]);

    useEffect(() => {
        const filteredData = Object.entries(mockNutrients)
            .filter(([date]) => date >= fromDate && date <= toDate)
            .map(([date, nutrient]) => {
                const filtered: any = { date };
                selectedNutrients.forEach(n => {
                    filtered[n] = nutrient[n as keyof NutrientData];
                });
                return filtered;
            });
            
        const newLabels = filteredData.map(item => item.date);
        
        setChartData(filteredData);
        setLabels(newLabels);

    }, [fromDate, toDate, selectedNutrients, mockNutrients]);

    const datasets = selectedNutrients.map((nutrient) => ({
        label: nutrientLabels[nutrient],
        data: chartData.map(item => item[nutrient]),
        borderColor: nutrientColors[nutrient],
        backgroundColor: nutrientColors[nutrient],
        tension: 0.3,
        fill: true,
    }));

    const data = { labels, datasets };

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
            y: { beginAtZero: true }
        }
    };

    return (
        <div style={{ width: '650px', height: '100%' }}>
            <Line data={data} options={options} />
        </div>
    );
}