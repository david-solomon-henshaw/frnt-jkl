import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const ScheduleAppointment = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patientRequestedDate, setPatientRequestedDate] = useState('');
  const [patientRequestedTime, setPatientRequestedTime] = useState('');
  const [department, setDepartment] = useState('');
  
  

  // Fetch patients from the backend
  useEffect(() => {

    const fetchPatients = async () => {
    

      try {
  
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/caregivers/all/patients`);
        setPatients(response.data);
      } catch (error) {
        toast.error('Error fetching patients');
      }
    };
  
    fetchPatients();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();


    // Validation
    if (!selectedPatient || !patientRequestedDate || !patientRequestedTime || !department) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // Send the appointment request to the backend
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/caregivers/schedule-appointment`, {
        patientId: selectedPatient,
        patientRequestedDate,
        patientRequestedTime,
        department,
      });

       // Reset the fields
    setSelectedPatient('');
    setPatientRequestedDate('');
    setPatientRequestedTime('');
    setDepartment('');

      toast.success('Appointment requested successfully!');
    } catch (error) {

      toast.error(error.response.data.message)
      
    

    
    }
  };

  return (
    <div className="container">
      <h2>Schedule Appointment</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="patient" className="form-label">Select Patient</label>
          <select
            id="patient"
            className="form-select"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            required
          >
            <option value="">Select Patient</option>
            {patients.map(patient => (
              <option key={patient._id} value={patient._id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="department" className="form-label">Department</label>
          <select
            id="department"
            className="form-select"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          >
            <option value="">Select Department</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Radiology">Radiology</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="patientRequestedDate" className="form-label">Appointment Date</label>
          <input
            type="date"
            id="patientRequestedDate"
            className="form-control"
            value={patientRequestedDate}
            onChange={(e) => setPatientRequestedDate(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="patientRequestedTime" className="form-label">Appointment Time</label>
          <input
            type="time"
            id="patientRequestedTime"
            className="form-control"
            value={patientRequestedTime}
            onChange={(e) => setPatientRequestedTime(e.target.value)}
            
          />
        </div>

        <button type="submit" className="btn btn-primary">Request Appointment</button>
      </form>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />

    </div>
  );
};

export default ScheduleAppointment;
