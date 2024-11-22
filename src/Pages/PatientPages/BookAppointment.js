import React, { useState } from 'react';
import { AiOutlineCalendar, AiOutlineClockCircle, AiOutlineUser } from 'react-icons/ai';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BookAppointment = () => {
  const [appointmentData, setAppointmentData] = useState({
    appointmentDate: '',
    department: '',
    appointmentTime: '',
  });

  const [alert, setAlert] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData({
      ...appointmentData,
      [name]: value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ message: '', type: '' }); // Reset alert
    setLoading(true);
  
    try {
      // Ensure required fields are present before sending the request
      if (!appointmentData.appointmentDate || !appointmentData.appointmentTime || !appointmentData.department) {
        setAlert({ message: 'Please fill all the required fields', type: 'danger' });
        setLoading(false);
        return;
      }
  
      // Get the token from localStorage (or sessionStorage, depending on where you store it)
      const token = localStorage.getItem('token'); // Replace with your token retrieval method
  
      if (!token) {
        setAlert({ message: 'You must be logged in to book an appointment', type: 'danger' });
        setLoading(false);
        return;
      }
  
      // Send appointment data to the backend (with token in the header)
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/patient/appointments`,
        {
          patientRequestedDate: appointmentData.appointmentDate, // Adjusted to match model
          patientRequestedTime: appointmentData.appointmentTime, // Adjusted to match model
          department: appointmentData.department,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token to the request header
          },
        }
      );
  
      if (response.data) {
        // Show success alert
        setAlert({ message: 'Appointment booked successfully!', type: 'success' });
        // Redirect to patient dashboard after success
        setTimeout(() => navigate('/patient'), 2000); // This 2-second delay is for the success message
      } else {
        // Show error alert if no data is returned
        setAlert({ message: response.data.message || 'Error booking appointment', type: 'danger' });
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
  
      // Improved error handling to catch different types of error responses
      const errorMessage = error.response?.data?.message || 'Error booking appointment. Please try again later.';
      setAlert({ message: errorMessage, type: 'danger' });
    } finally {
      setLoading(false); // Disable the loading spinner regardless of success or failure
    }
  };
  

  return (
    <div className="p-4">
      <h2 className="text-center mb-4">Book Appointment</h2>

      {/* Alert for success or error */}
      {alert.message && (
        <div className={`alert alert-${alert.type}`} role="alert">
          {alert.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4 position-relative">
          <label htmlFor="appointmentDate" className="form-label fw-bold">Appointment Date</label>
          <AiOutlineCalendar 
            className="position-absolute" 
            style={{ left: '10px', top: '38px', color: '#7a7a7a' }} 
            size={20} 
          />
          <input 
            type="date" 
            className="form-control ps-5" 
            id="appointmentDate" 
            name="appointmentDate" 
            value={appointmentData.appointmentDate} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="mb-4 position-relative">
          <label htmlFor="department" className="form-label fw-bold">Department</label>
          <AiOutlineUser 
            className="position-absolute" 
            style={{ left: '10px', top: '38px', color: '#7a7a7a' }} 
            size={20} 
          />
          <select 
            className="form-select ps-5" 
            id="department" 
            name="department" 
            value={appointmentData.department} 
            onChange={handleChange} 
            required
          >
            <option value="">Select a department</option>
            <option value="General Surgery">General Surgery</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Neurology ">Neurology </option>

            {/* */}
            {/* Add more departments as needed */}
          </select>
        </div>

        <div className="mb-4 position-relative">
          <label htmlFor="appointmentTime" className="form-label fw-bold">Appointment Time</label>
          <AiOutlineClockCircle 
            className="position-absolute" 
            style={{ left: '10px', top: '38px', color: '#7a7a7a' }} 
            size={20} 
          />
          <input 
            type="time" 
            className="form-control ps-5" 
            id="appointmentTime" 
            name="appointmentTime" 
            value={appointmentData.appointmentTime} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="d-flex justify-content-end">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Booking...' : 'Proceed to Book'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookAppointment;
