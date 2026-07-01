import React, { useCallback, useEffect, useState } from 'react';
import { Table, Input, Button, Form, Modal, message } from 'antd';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import api from '../services/api';
import './DataPage.css';

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

function DataPage() {
  const [heartRateData, setHeartRateData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [record, setRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const getRealTime = () => {
    const currentTime = new Date();
    return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRealDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get('/heart-rate-data');

      setHeartRateData(response.data);
    } catch (error) {
      message.error('Failed to load heart rate data.');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tableCellStyle = {
    fontSize: '15px',
  };

  const closeForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setRecord(null);
    form.resetFields();
  };

  const openAddForm = () => {
    setRecord(null);
    setIsEditing(false);
    form.setFieldsValue({
      time: getRealTime(),
      date: getRealDate(),
      heartRate: undefined,
      recommendation: '',
    });
    setShowForm(true);
  };

  const handleEdit = (selectedRecord) => {
    setRecord(selectedRecord._id);
    setIsEditing(true);
    form.setFieldsValue({
      time: selectedRecord.time,
      date: selectedRecord.date,
      heartRate: selectedRecord.heartRate,
      recommendation: selectedRecord.recommendation,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/heart-rate-data/${id}`);
      await fetchData();
      message.success('Record deleted successfully.');
    } catch (error) {
      message.error('Failed to delete record.');
    }
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (text) => <span style={tableCellStyle}>{text}</span>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => <span style={tableCellStyle}>{text}</span>,
    },
    {
      title: 'Heart Rate',
      dataIndex: 'heartRate',
      key: 'heartRate',
      render: (text) => <span style={tableCellStyle}>{text}</span>,
    },
    {
      title: 'Recommendation',
      dataIndex: 'recommendation',
      key: 'recommendation',
      render: (text) => <span style={tableCellStyle}>{text}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, selectedRecord) => (
        <span>
          <Button type="primary" className="table-but" onClick={() => handleEdit(selectedRecord)}>
            Edit
          </Button>
          <Button className="table-but" onClick={() => handleDelete(selectedRecord._id)}>
            Delete
          </Button>
        </span>
      ),
    },
  ];

  const exportToCsv = (data) => {
    const headers = ['time', 'date', 'heartRate', 'recommendation'];
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = data.map((item) => headers.map((header) => escapeCsv(item[header])).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'heart_rate_data.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const onFinish = async (values) => {
    try {
      if (record) {
        await api.put(`/heart-rate-data/${record}`, values);
        message.success('Record updated successfully.');
      } else {
        await api.post('/heart-rate-data', values);
        message.success('Heart rate data added successfully.');
      }

      await fetchData();
      closeForm();
    } catch (error) {
      message.error(record ? 'Failed to update record.' : 'Failed to add heart rate data.');
    }
  };

  const onHeartRateChange = (value) => {
    const heartRate = Number(value);

    if (!Number.isFinite(heartRate)) {
      form.setFieldsValue({ recommendation: '' });
      return;
    }

    const recommendation =
      heartRate > 120 || heartRate < 50
        ? 'Pay attention, you have some problem with heart rate!'
        : 'The data are within normal limits.';

    form.setFieldsValue({ recommendation });
  };

  const filteredData = heartRateData.filter(
    (data) =>
      data.time.toLowerCase().includes(searchText.toLowerCase()) ||
      data.date.toLowerCase().includes(searchText.toLowerCase()) ||
      data.heartRate.toString().includes(searchText)
  );

  return (
    <div className="main-page">
      <Input.Search
        placeholder="Search"
        style={{ width: 230, marginBottom: 10 }}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <Button type="primary" className="add-button" onClick={openAddForm}>
        Add Heart Rate Data
      </Button>
      <Button type="primary" onClick={() => exportToCsv(filteredData)}>
        Export CSV
      </Button>
      <Modal title={isEditing ? 'Edit Heart Rate Data' : 'Add Heart Rate Data'} open={showForm} onCancel={closeForm} footer={null}>
        <Form form={form} onFinish={onFinish}>
          <Form.Item label="Time" name="time" rules={[{ required: true, message: 'Time is required.' }]}>
            <Input readOnly />
          </Form.Item>
          <Form.Item label="Date" name="date" rules={[{ required: true, message: 'Date is required.' }]}>
            <Input readOnly />
          </Form.Item>
          <Form.Item label="Heart Rate" name="heartRate" rules={[{ required: true, message: 'Heart rate is required.' }]}>
            <Input type="number" min="1" onChange={(e) => onHeartRateChange(e.target.value)} />
          </Form.Item>
          <Form.Item label="Recommendation" name="recommendation" rules={[{ required: true, message: 'Recommendation is required.' }]}>
            <Input readOnly />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {isEditing ? 'Save' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {heartRateData.length > 0 ? (
        <Table rowKey="_id" dataSource={filteredData} columns={columns} />
      ) : (
        <p>No data</p>
      )}
      <ResponsiveContainer width="100%" height={500} className="highlighted">
        <LineChart data={filteredData} className="graph">
          <XAxis dataKey="time">
            <Label value="Time" position="insideBottom" offset={-5}></Label>
          </XAxis>
          <YAxis>
            <Label value="Heart rate" position="insideLeft" angle={-90}></Label>
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="heartRate" stroke="#8884d8" strokeWidth={2} dot={{ strokeWidth: 2, r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DataPage;
