import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingModal from '../../Components/LoadingModal';
import { Tab, Tabs } from 'react-bootstrap';
import { FaRegCalendarTimes, FaEdit, FaCheck, FaHourglassHalf } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [endTime, setEndTime] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token')

  const decoded = jwtDecode(token);
  const caregiverId = decoded.id

  useEffect(() => {
    if (!token) {
      setError('No token found in local storage');
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/caregivers/${caregiverId}/appointments`,
          {
            headers: { Authorization: `Bearer ${token}` }
          });
        setAppointments(response.data);
        console.log(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [caregiverId]);

  const formatTime = (time) => {
    if (!time) {
      return 'N/A';  // Fallback if time is undefined or null
    }

    if (time.includes('T')) {
      const date = new Date(time);
      if (isNaN(date.getTime())) {
        return 'Invalid Time'; // Fallback for invalid date
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    const [hour, minute] = time.split(':');
    if (!hour || !minute) {
      return 'Invalid Time'; // Fallback for incorrect time format
    }

    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const toggleEditMode = (appointmentId) => {
    setEditMode((prev) => (prev === appointmentId ? null : appointmentId));
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  const getCurrentTime = () => {
    const date = new Date();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/caregivers/${appointmentId}/appointment`, {
        status: newStatus,
        endTime: newStatus === 'completed' ? getCurrentTime() : null, // Send current time as endTime if status is 'completed'
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setAppointments((prevAppointments) =>
        prevAppointments.map((app) =>
          app._id === appointmentId ? { ...app, status: newStatus, endTime: newStatus === 'completed' ? getCurrentTime() : null } : app
        )
      );
      setEditMode(null);
      setEndTime(''); // Reset endTime
    } catch (err) {
      console.error(err);
      setError('Error updating appointment status');
    }
  };

  const startAppointment = (appointmentId) => {
    updateAppointmentStatus(appointmentId, 'in-progress');
  };

  const tableStyles = {
    container: {
      marginTop: '1rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      borderRadius: '10px',
      overflow: 'hidden',
    },
    table: {
      fontSize: '0.875rem',
      borderCollapse: 'collapse',
      borderSpacing: 0,
      width: '100%',
    },
    th: {
      padding: '12px 16px',
      backgroundColor: '#f8f9fa',
      color: '#64748b',
      textAlign: 'center',
      borderBottom: '1px solid rgba(230, 232, 236, 0.8)',
      borderRight: '1px solid rgba(230, 232, 236, 0.8)',
    },
    td: {
      padding: '12px 16px',
      textAlign: 'center',
      borderBottom: '1px solid rgba(230, 232, 236, 0.8)',
      borderRight: '1px solid rgba(230, 232, 236, 0.8)',
    },
    lastColumn: {
      borderRight: 'none',
    },
  };

  const renderAppointmentsTable = (filteredAppointments, tabStatus) => {
    if (filteredAppointments.length === 0) {
      return (
        <div className="d-flex flex-column align-items-center text-muted">
          <FaRegCalendarTimes size={50} className="mb-3" />
          <p>No appointments found in this category.</p>
        </div>
      );
    }

    return (
      <div className="table-responsive" style={tableStyles.container}>
<table className="table mb-0" style={tableStyles.table}>
  <thead>
    <tr>
      <th style={tableStyles.th}>Date Requested</th>
      <th style={tableStyles.th}>Time Requested</th>
      <th style={tableStyles.th}>Patient</th>
      {tabStatus === 'completed' && (
        <>
          <th style={tableStyles.th}>Start Time</th>
          <th style={{ ...tableStyles.th, ...tableStyles.lastColumn }}>End Time</th>
        </>
      )}
      {tabStatus !== 'pending' && tabStatus !== 'completed' && (
        <th style={tableStyles.th}>Actions</th>
      )}
    </tr>
  </thead>
  <tbody>
    {filteredAppointments.map((appointment) => (
      <tr key={appointment._id} className="align-middle">
        <td style={tableStyles.td}>
          {new Date(appointment.RequestedDate).toLocaleDateString()}
        </td>
        <td style={tableStyles.td}>{formatTime(appointment.RequestedTime)}</td>
        <td style={tableStyles.td}>
          {appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'N/A'}
        </td>
        {tabStatus === 'completed' && (
          <>
            <td style={tableStyles.td}>
              {appointment.startTime ? formatTime(appointment.startTime) : 'Not Set'}
            </td>
            <td style={{ ...tableStyles.td, ...tableStyles.lastColumn }}>
              {appointment.endTime ? formatTime(appointment.endTime) : 'Not Set'}
            </td>
          </>
        )}
        {tabStatus !== 'pending' && tabStatus !== 'completed' && (
          <td style={tableStyles.td}>
            {tabStatus === 'approved' && (
              <button
                className="btn btn-info btn-sm"
                onClick={() => startAppointment(appointment._id)}
              >
                <FaHourglassHalf /> Start
              </button>
            )}
            {tabStatus === 'in-progress' && (
              <button
                className="btn btn-success btn-sm"
                onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
              >
                <FaCheck /> Completed
              </button>
            )}
          </td>
        )}
      </tr>
    ))}
  </tbody>
</table>
      </div>
    );
  };

  return (
    <div className="p-4">
      {error && <div className="alert alert-danger">{error}</div>}
      <Tabs defaultActiveKey="approved" id="appointments-tab" className="mb-3">

        <Tab eventKey="pending" title="Pending">
          {renderAppointmentsTable(
            appointments.filter((appointment) => appointment.status === 'pending'),
            'pending'
          )}
        </Tab>
        <Tab eventKey="approved" title="Approved">
          {renderAppointmentsTable(
            appointments.filter((appointment) => appointment.status === 'approved'),
            'approved'
          )}
        </Tab>
        <Tab eventKey="in-progress" title="In Progress">
          {renderAppointmentsTable(
            appointments.filter((appointment) => appointment.status === 'in-progress'),
            'in-progress'
          )}
        </Tab>
        <Tab eventKey="completed" title="Completed">
          {renderAppointmentsTable(
            appointments.filter((appointment) => appointment.status === 'completed'),
            'completed'
          )}
        </Tab>

      </Tabs>
    </div>
  );
};

export default Appointments;
