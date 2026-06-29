import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Input, Button, Form, Modal, message } from 'antd';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import * as XLSX from 'xlsx';
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .post('http://localhost:4000/heart-rate-data-get')
      .then((response) => {
        console.log(response.data);
        setHeartRateData(response.data.reverse());
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const tableCellStyle = {
    fontSize: '15px',
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
      render: (text, record) => (
        <span>
          <Button type="primary" className='table-but' onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button className='table-but' onClick={() => handleDelete(record._id)}>
            Delete
          </Button>
        </span>
      ),
    },
  ];

  const handleEdit = (record) => {
    setShowForm(true);
    form.setFieldsValue({
      time: record.time,
      date: record.date,
      heartRate: record.heartRate,
      recommendation: record.recommendation,
    });
    setIsEditing(true);
    setRecord(record._id);
  };
  
  const handleDelete = (id) => {
    axios
     .post(`http://localhost:4000/heart-rate-data-delete/${id}`)
     .then(() => {
        fetchData();
        message.success('Record deleted successfully!');
      })
     .catch((error) => {
        console.error(error);
        message.error('Failed to delete record!');
      });
  };

  const handleFormVisible = () => {
    setShowForm(!showForm);
    setIsEditing(false);
  };

  const exportToExcel = (data) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HeartRateData');
    XLSX.writeFile(wb, 'heart_rate_data.xlsx');
  };

  const [form] = Form.useForm();

  const onFinish = (values) => {
    if (record) {
      axios
        .put(`http://localhost:4000/heart-rate-data-update/${record}`, values)
        .then(() => {
          fetchData();
          setTimeout(() => {
            message.success('Record updated successfully!');
            handleFormVisible();
          }, 1000);
        })
        .catch((error) => {
          console.log(error);
          setTimeout(() => {
            message.error('Failed to update record!');
            handleFormVisible();
          }, 1000);
        });
    } else {
      axios
        .post('http://localhost:4000/heart-rate-data-send', values)
        .then(() => {
          fetchData();
          setTimeout(() => {
            message.success('Heart Rate Data added successfully!');
            handleFormVisible();
          }, 1000);
        })
        .catch((error) => {
          console.log(error);
          setTimeout(() => {
            message.error('Failed to add heart rate data!');
            handleFormVisible();
          }, 1000);
        });
    }
  };

  const getRealTime = () => {
    const currentTime = new Date();
    const time = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return time;
  };

  const getRealDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Додаємо 1 до місяця, оскільки він починається з 0
    const day = String(currentDate.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;
    return date;
  };

  const onHeartRateChange = (value) => {
    const recommendation = value > 120 || value < 50
      ? "Pay attention, you have some problem with heart rate!"
      : "The data are within normal limits.";
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
      <Button type="primary" className="add-button" onClick={handleFormVisible}>
        Add Heart Rate Data
      </Button>
      <Button type="primary" onClick={() => exportToExcel(filteredData)}>
        Export to Excel
      </Button>
      <Modal title={isEditing ? 'Edit Heart Rate Data' : 'Add Heart Rate Data'} visible={showForm} onCancel={handleFormVisible} footer={null}>
        <Form form={form} onFinish={onFinish} record={record}>
          <Form.Item label="Time" name="time" initialValue={getRealTime()}>
            <Input readOnly />
          </Form.Item>
          <Form.Item label="Date" name="date" initialValue={getRealDate()}>
            <Input readOnly />
          </Form.Item>
          <Form.Item label="Heart Rate" name="heartRate">
            <Input onChange={(e) => onHeartRateChange(e.target.value)} />
          </Form.Item>
          <Form.Item label="Recommendation" name="recommendation">
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
        <Table dataSource={filteredData} columns={columns} />
      ) : (
        <p>No data</p>
      )}
      <ResponsiveContainer width="100%" height={500} className="highlighted">
        <LineChart data={filteredData} className="graph">
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

export default DataPage;
