import React from 'react';

interface BarChartData {
    label: string;
    value: number;
    color: string;
}

interface BarChartProps {
    data: BarChartData[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.value), 1); // Avoid division by zero
    const chartHeight = 150;
    const barWidth = 40;
    const barMargin = 20;
    const chartWidth = data.length * (barWidth + barMargin);

    return (
        <div className="flex justify-center items-end" style={{ height: `${chartHeight + 40}px` }}>
            <svg width={chartWidth} height={chartHeight + 40} aria-label="Bar chart" role="img">
                <g transform="translate(0, 10)">
                    {data.map((item, index) => {
                        const barHeight = (item.value / maxValue) * chartHeight;
                        const x = index * (barWidth + barMargin);
                        const y = chartHeight - barHeight;

                        return (
                            <g key={item.label}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    fill={item.color}
                                    rx="4"
                                    ry="4"
                                >
                                     <title>{`${item.label}: ${item.value}`}</title>
                                </rect>
                                <text
                                    x={x + barWidth / 2}
                                    y={y - 5}
                                    textAnchor="middle"
                                    fontSize="12"
                                    fontWeight="bold"
                                    fill="#334155"
                                >
                                    {item.value}
                                </text>
                                <text
                                    x={x + barWidth / 2}
                                    y={chartHeight + 15}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill="#475569"
                                >
                                    {item.label}
                                </text>
                            </g>
                        );
                    })}
                </g>
                 <line x1="0" y1={chartHeight + 10} x2={chartWidth} y2={chartHeight + 10} stroke="#cbd5e1" strokeWidth="1" />
            </svg>
        </div>
    );
};

export default BarChart;