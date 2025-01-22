import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

const data1 = [
  { label: 'Group A', value: 400 },
  { label: 'Group B', value: 300 },
  { label: 'Group C', value: 300 },
  { label: 'Group D', value: 200 },
  { label: 'Group E', value: 278 },
  { label: 'Group F', value: 189 },
];



export default function SimplePieChart() {
  return (
    <PieChart
      series={[
        {
          outerRadius: 80,
          data: data1,
          cx: 500,
          cy: 200,
          innerRadius: 40,
        },
       
      ]}
      height={300}
      slotProps={{
        legend: { hidden: false },
      }}
    />
  );
}