import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from './UI';

const data = [
  { name: 'Mon', amount: 120 },
  { name: 'Tue', amount: 300 },
  { name: 'Wed', amount: 150 },
  { name: 'Thu', amount: 480 },
  { name: 'Fri', amount: 220 },
  { name: 'Sat', amount: 600 },
  { name: 'Sun', amount: 350 },
];

export function SpendingChart() {
  return (
    <Card className="h-64 p-4 mt-6">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-black text-sm tracking-tight text-slate-800 uppercase tracking-widest">Growth Analytics</h3>
        <select className="text-[10px] font-black uppercase tracking-widest bg-slate-50 border-none rounded-xl px-3 py-1.5 outline-none">
          <option>Weekly View</option>
          <option>Monthly View</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 800 }} 
            dy={10}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
            itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#10b981' }}
            labelStyle={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#10b981" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorAmount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
