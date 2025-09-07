
import React from 'react';

interface Dataset {
    label: string;
    data: number[];
    color: string;
}

interface LineChartProps {
    data: {
        labels: string[];
        datasets: Dataset[];
    };
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
    const { labels, datasets } = data;
    const width = 600;
    const height = 300;
    const padding = 50;

    const maxY = Math.max(...datasets.flatMap(d => d.data), 1) * 1.2; // Add 20% padding to top

    const getX = (index: number) => padding + (index * (width - 2 * padding)) / (labels.length - 1);
    const getY = (value: number) => height - padding - (value / maxY) * (height - 2 * padding);

    const yAxisLabels = Array.from({ length: 5 }, (_, i) => Math.round((maxY / 4) * i));

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart" className="min-w-[600px]">
                {/* Y-Axis Grid Lines and Labels */}
                {yAxisLabels.map((label, i) => (
                    <g key={i} className="text-gray-400">
                        <line
                            x1={padding}
                            y1={getY(label)}
                            x2={width - padding}
                            y2={getY(label)}
                            stroke="currentColor"
                            strokeWidth="0.5"
                            strokeDasharray="2,2"
                        />
                        <text
                            x={padding - 10}
                            y={getY(label) + 4}
                            textAnchor="end"
                            fontSize="10"
                            fill="#6b7280"
                        >
                            {label}
                        </text>
                    </g>
                ))}

                {/* X-Axis Labels */}
                {labels.map((label, i) => (
                    <text
                        key={i}
                        x={getX(i)}
                        y={height - padding + 20}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#6b7280"
                    >
                        {label}
                    </text>
                ))}

                {/* Lines and Points */}
                {datasets.map(dataset => {
                    const path = dataset.data
                        .map((point, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(point)}`)
                        .join(' ');
                    
                    return (
                        <g key={dataset.label}>
                            <path d={path} fill="none" stroke={dataset.color} strokeWidth="2" />
                            {dataset.data.map((point, i) => (
                                <circle
                                    key={i}
                                    cx={getX(i)}
                                    cy={getY(point)}
                                    r="3"
                                    fill={dataset.color}
                                >
                                     <title>{`${dataset.label} on ${labels[i]}: ${point}`}</title>
                                </circle>
                            ))}
                        </g>
                    );
                })}
            </svg>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
                {datasets.map(dataset => (
                    <div key={dataset.label} className="flex items-center text-sm text-gray-600">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: dataset.color }}></span>
                        <span>{dataset.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LineChart;
