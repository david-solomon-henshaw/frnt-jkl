import React, { useState } from 'react';
import { AiOutlineCalendar, AiOutlineClockCircle, AiOutlineUser } from 'react-icons/ai';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from '../../context/authContext';

const BookAppointment = () => {

  const { logout } = useAuth();

  const [appointmentData, setAppointmentData] = useState({
    appointmentDate: '',
    department: '',
    appointmentTime: '',
  });


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

    setLoading(true);

    try {
      // Ensure required fields are present before sending the request
      if (!appointmentData.appointmentDate || !appointmentData.appointmentTime || !appointmentData.department) {
        toast.error('Please fill all the required fields');
        setLoading(false);
        return;
      }

      // Get the token from localStorage (or sessionStorage, depending on where you store it)
      const token = localStorage.getItem('token'); // Replace with your token retrieval method

      if (!token) {
        toast.error('You must be logged in to book an appointment');
        setLoading(false);
        logout();
        navigate('/');
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
      );

      if (response.data) {
        // Show success alert
        toast.success('Appointment booked successfully!');
        setAppointmentData({
          appointmentDate: '',
          department: '',
          appointmentTime: '',
        });


      }
    } catch (error) {
      toast.error(error.response.data.message);


    } finally {
      setLoading(false); // Disable the loading spinner regardless of success or failure
    }
  };


  return (
    <div className="p-4">
      <h2 className="text-center mb-4">Book Appointment</h2>



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
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Radiology">Radiology</option>
            <option value="General Surgery">General Surgery</option>
            <option value="Emergency Medicine">Emergency Medicine</option>
            <option value="Oncology">Oncology</option>
            <option value="Gynecology">Gynecology</option>
            <option value="Urology">Urology</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="Anesthesiology">Anesthesiology</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Endocrinology">Endocrinology</option>
            <option value="Gastroenterology">Gastroenterology</option>
            <option value="Hematology">Hematology</option>
            <option value="Infectious Diseases">Infectious Diseases</option>
            <option value="Nephrology">Nephrology</option>
            <option value="Pulmonology">Pulmonology</option>
            <option value="Rheumatology">Rheumatology</option>
            <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
            <option value="Rehabilitation Medicine">Rehabilitation Medicine</option>
            <option value="Ophthalmology">Ophthalmology</option>
            <option value="Otolaryngology (ENT)">Otolaryngology (ENT)</option>
            <option value="Transplant Surgery">Transplant Surgery</option>
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

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
    </div>
  );
};

export default BookAppointment;
