import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Label } from 'recharts';
import api from '../services/api';
import './Home.css';

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p>Date: {data.date}</p>
        <p>Time: {data.time}</p>
        <p>Heart Rate: {data.heartRate}</p>
      </div>
    );
  }
  return null;
}

function Histogram({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300} className="histogram">
      <BarChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <CartesianGrid stroke="#ccc" />
        <Tooltip />
        <Bar dataKey="heartRate" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function Home() {
  const [heartRateData, setHeartRateData] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    api
      .get('/heart-rate-data')
      .then((response) => {
        setLoadError('');
        setHeartRateData(response.data);
      })
      .catch(() => {
        setLoadError('Failed to load heart rate data.');
      });
  };
  
  return (
    <div className="main-page">
      {loadError && <p>{loadError}</p>}
      <Histogram data={heartRateData} />
      <ResponsiveContainer width="100%" height={550} className="highlighted">
        <LineChart data={heartRateData} className="graph">
          <XAxis dataKey="time">
            <Label value="Time" position="insideBottom" offset={-5}></Label>
          </XAxis>
          <YAxis>
            <Label value={"Heart rate"} position={'insideLeft'} angle={-90}></Label>
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="heartRate" stroke="#8884d8" strokeWidth={2} dot={{ strokeWidth: 2, r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Home;
