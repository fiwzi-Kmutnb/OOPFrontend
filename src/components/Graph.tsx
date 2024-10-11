import Chart from 'chart.js/auto';
import { useEffect, useRef } from 'react';
interface GraphProps {
    lables: string[];
    data: number[];
}
export default function Graph(
    { lables, data }: GraphProps
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (canvasRef.current === null) return;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx === null) return;
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
            labels: lables,
            datasets: [{
                label: '',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
            },
            options: {
            plugins: {
                legend: {
                display: false
                }
            },
            scales: {
                y: {
                beginAtZero: true
                },
                x: {
                display: false
                }
            }
            }
        });

        return () => {
            chart.destroy();
        };
    }
        , [lables, data])

    return (
        <>
            <canvas ref={canvasRef}></canvas>
        </>
    )

}