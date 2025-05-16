'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { name: 'Vacas', value: 400 },
  { name: 'Ranas', value: 300 },
  { name: 'Aves', value: 500 },
  { name: 'Peces', value: 200 },
];

const pieData = [
  { name: 'Grupo A', value: 400 },
  { name: 'Grupo B', value: 300 },
  { name: 'Grupo C', value: 300 },
];

const colores = ['#8884d8', '#82ca9d', '#ffc658'];

export default function Home() {
  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Dashboard</h1>

      {/* Contenedor general para adaptar al tamaño de pantalla */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Gráfico de Barras */}
        <div style={{ width: '100%', height: 250, maxWidth: 500 }}>
          <h2 style={{ fontSize: '18px' }}>Gráfico de Barras</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Línea */}
        <div style={{ width: '100%', height: 250, maxWidth: 500 }}>
          <h2 style={{ fontSize: '18px' }}>Gráfico de Línea</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pastel */}
        <div style={{ width: '100%', height: 250, maxWidth: 500 }}>
          <h2 style={{ fontSize: '18px' }}>Gráfico de Pastel</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                label
                dataKey="value"
              >
                {pieData.map((item, index) => (
                  <Cell key={index} fill={colores[index % colores.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
//wandahoy