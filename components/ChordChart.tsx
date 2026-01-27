
import React from 'react';
import { ChordData, FretValue } from '../types';

interface ChordChartProps {
  chord: ChordData;
  size?: 'sm' | 'md' | 'lg';
}

const ChordChart: React.FC<ChordChartProps> = ({ chord, size = 'md' }) => {
  const { frets, name, baseFret = 1 } = chord;
  
  const scale = size === 'sm' ? 0.6 : size === 'lg' ? 1.2 : 1;
  const width = 120 * scale;
  const height = 150 * scale;
  
  const margin = { top: 30 * scale, left: 20 * scale, right: 20 * scale, bottom: 20 * scale };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const numFrets = 5;
  const numStrings = 6;
  
  const xStep = chartWidth / (numStrings - 1);
  const yStep = chartHeight / numFrets;

  const getFretY = (f: number) => {
    const relativeFret = f - (baseFret > 1 ? baseFret - 1 : 0);
    return margin.top + (relativeFret - 0.5) * yStep;
  };

  // Extract base name and position name for better UI display
  const nameParts = name.split(' - ');
  const baseName = nameParts[0];
  const positionName = nameParts[1] || '';

  return (
    <div className="flex flex-col items-center bg-slate-900/40 p-5 rounded-[2.5rem] border border-slate-800 hover:border-amber-500/50 transition-all duration-300 group/card shadow-xl hover:shadow-amber-500/10">
      <div className="text-center mb-3 min-h-[40px] flex flex-col justify-center">
        <h3 className="text-amber-500 font-black text-sm group-hover/card:scale-105 transition-transform truncate max-w-[110px]">
          {baseName}
        </h3>
        {positionName && (
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter opacity-80">
            {positionName}
          </p>
        )}
      </div>

      <svg width={width} height={height} className="overflow-visible">
        {/* Nut (if baseFret is 1) */}
        {baseFret === 1 && (
          <line 
            x1={margin.left} 
            y1={margin.top} 
            x2={width - margin.right} 
            y2={margin.top} 
            stroke="#f8fafc" 
            strokeWidth={4 * scale} 
            strokeLinecap="round"
          />
        )}
        
        {/* Frets */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line 
            key={`fret-${i}`}
            x1={margin.left} 
            y1={margin.top + i * yStep} 
            x2={width - margin.right} 
            y2={margin.top + i * yStep} 
            stroke="#334155" 
            strokeWidth={1.5 * scale} 
            strokeLinecap="round"
          />
        ))}

        {/* Strings */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line 
            key={`string-${i}`}
            x1={margin.left + i * xStep} 
            y1={margin.top} 
            x2={margin.left + i * xStep} 
            y2={margin.top + chartHeight} 
            stroke="#475569" 
            strokeWidth={Math.max(1, (6 - i) * 0.4) * scale} 
          />
        ))}

        {/* Chord Marks (Dots and X/O) */}
        {frets.map((fret, i) => {
          if (fret === 'x' || fret === null) {
              return (
                <text 
                    key={`mark-${i}`}
                    x={margin.left + i * xStep} 
                    y={margin.top - 10 * scale} 
                    textAnchor="middle" 
                    fill="#ef4444" 
                    fontSize={11 * scale}
                    fontWeight="black"
                >
                    ×
                </text>
              );
          }
          if (fret === 0) {
              return (
                <circle 
                    key={`mark-${i}`}
                    cx={margin.left + i * xStep} 
                    cy={margin.top - 10 * scale} 
                    r={3.5 * scale} 
                    fill="none" 
                    stroke="#fbbf24" 
                    strokeWidth={1.5 * scale}
                />
              );
          }
          
          return (
            <g key={`fret-dot-${i}`}>
                <circle 
                    cx={margin.left + i * xStep} 
                    cy={getFretY(fret)} 
                    r={6.5 * scale} 
                    fill="#fbbf24" 
                    className="drop-shadow-[0_2px_4px_rgba(251,191,36,0.4)]"
                />
                {chord.fingers && chord.fingers[i] !== null && (
                    <text
                        x={margin.left + i * xStep} 
                        y={getFretY(fret)} 
                        dy={3.5 * scale}
                        textAnchor="middle"
                        fill="#1e293b"
                        fontSize={8 * scale}
                        fontWeight="black"
                    >
                        {chord.fingers[i]}
                    </text>
                )}
            </g>
          );
        })}

        {/* Base Fret Label */}
        {baseFret > 1 && (
            <text 
                x={margin.left - 16 * scale} 
                y={margin.top + yStep / 2 + 4 * scale} 
                fill="#fbbf24" 
                fontSize={9 * scale}
                fontWeight="bold"
            >
                {baseFret}
            </text>
        )}
      </svg>

      <div className="mt-4 px-3 py-1 bg-slate-950/50 rounded-full text-[9px] text-slate-500 font-mono tracking-widest uppercase border border-slate-800">
        {frets.map(f => f === 'x' ? 'x' : f).join(' ')}
      </div>
    </div>
  );
};

export default ChordChart;
