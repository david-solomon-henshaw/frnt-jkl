import React from 'react';
import { FaCalendarTimes } from 'react-icons/fa'; // Calendar icon for "No appointments found"

const NoAppointmentsFound = () => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ flexDirection: 'column' }}>
      <FaCalendarTimes style={{ fontSize: '5rem', color: '#6c757d' }} />
      <div className="mt-3">
        <h3 className="text-muted">No Appointments Found</h3>
        <p className="text-center text-muted">It seems there are no appointments to show at the moment. Please check back later or try again.</p>
      </div>
    </div>
  );
};

export default NoAppointmentsFound;
