

import React, { useState, useEffect } from "react";
import { Tabs, Tab, Table, Button, Modal, Form } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalType, setModalType] = useState(null); // 'approve', 'reassign', or null
  const [formData, setFormData] = useState({
    caregiver: "",
    appointmentDate: "",
    startTime: "",
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, caregiversRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/appointments/all`),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/caregivers`)
        ]);
        setAppointments(appointmentsRes.data);
        setCaregivers(caregiversRes.data);
      } catch (error) {
        toast.error("Failed to fetch data. Please refresh the page.");
      }
    };
    fetchData();
  }, [appointments]);

  // Filter available caregivers based on department and availability
  const getFilteredCaregivers = () => {
    if (!selectedAppointment) return [];
    
    return caregivers.filter(caregiver => {
      const isInSameDepartment = caregiver.department === selectedAppointment.department;
      const isAvailable = caregiver.available;
      const isNotCurrentCaregiver = modalType === 'reassign' ? 
        caregiver._id !== selectedAppointment.caregiver?._id : true;

      return isInSameDepartment && isAvailable && isNotCurrentCaregiver;
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  // Modal handlers
  const handleModalOpen = (appointment, type) => {
    setSelectedAppointment(appointment);
    setModalType(type);
    setFormData({
      caregiver: "",
      appointmentDate: "",
      startTime: "",
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedAppointment(null);
    setModalType(null);
    setFormData({
      caregiver: "",
      appointmentDate: "",
      startTime: "",
    });
  };

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Action handlers
  const handleApprove = async () => {
    try {

      let updatedAppointment;

      const payload = {
        caregiver: formData.caregiver || selectedAppointment.caregiver?._id,
        appointmentDate: formData.appointmentDate,
        startTime: formData.startTime,
        status: "approved"
      };

     const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/appointments/${selectedAppointment._id}/approve`,
        payload
      );
      updatedAppointment = response.data; // Use the response from the server

  

      toast.success("Appointment approved successfully!");
        // Update state using the server response
      handleModalClose();
    } catch (error) {
      toast.error("Failed to approve appointment. Please try again.");
    }
  };

  const handleReassign = async () => {
    try {

      let updatedAppointment;

     const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/appointments/${selectedAppointment._id}/reassign`,
        { caregiver: formData.caregiver }
      );
      updatedAppointment = response.data; // Use the response from the server
      setAppointments(prev => 
        prev.map(appt => 
          appt._id === selectedAppointment._id ? updatedAppointment : appt
        )
      );
   

      toast.success("Caregiver reassigned successfully!");
       // Update state using the server response
  
      handleModalClose();
    } catch (error) {
      toast.error("Failed to reassign caregiver. Please try again.");
    }
  };

  const handleCancel = async (appointmentId) => {
    try {

      let updatedAppointment;

    const response =  await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/appointments/${appointmentId}/cancel`
      );

      updatedAppointment = response.data; // Use the response from the server

      setAppointments(prev => 
        prev.map(appt => 
          appt._id === appointmentId._id ? updatedAppointment : appt
        )
      );
   

      toast.success("Appointment canceled successfully!");
    } catch (error) {
      toast.error("Failed to cancel appointment. Please try again.");
    }
  };

  // Render table columns based on tab
  const renderTableColumns = (status) => {
    const baseColumns = [
      { header: "Patient", key: "patient", render: (appt) => appt.patient.firstName },
      { header: "Department", key: "department", render: (appt) => appt.department },
      { 
        header: status === "approved" ? "Approved Date" : "Requested Date",
        key: "date",
        render: (appt) => formatDate(status === "approved" ? appt.appointmentDate : appt.RequestedDate)
      },
      {
        header: status === "approved" ? "Approved Time" : "Requested Time",
        key: "time",
        render: (appt) => status === "approved" ? appt.appointmentTime : appt.RequestedTime
      },
      { 
        header: "Caregiver", 
        key: "caregiver", 
        render: (appt) => appt.caregiver?.firstName || "Unassigned"
      },
      {
        header: "Actions",
        key: "actions",
        render: (appt) => (
          <div className="d-flex gap-2">
            {status === "pending" && (
              <>
                <Button
                  variant="primary"
                  onClick={() => handleModalOpen(appt, "approve")}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleCancel(appt._id)}
                >
                  Cancel
                </Button>
              </>
            )}
            {status === "approved" && (
              <Button
                variant="warning"
                onClick={() => handleModalOpen(appt, "reassign")}
              >
                Reassign
              </Button>
            )}
          </div>
        )
      }
    ];

    return baseColumns;
  };

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onSelect={setActiveTab}
        className="mb-3"
      >
        {["pending", "approved", "in-progress", "completed", "canceled"].map((status) => (
          <Tab eventKey={status} title={status.charAt(0).toUpperCase() + status.slice(1)} key={status}>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  {renderTableColumns(status).map(column => (
                    <th key={column.key}>{column.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments
                  .filter(appt => appt.status === status)
                  .map(appt => (
                    <tr key={appt._id}>
                      {renderTableColumns(status).map(column => (
                        <td key={`${appt._id}-${column.key}`}>
                          {column.render(appt)}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Tab>
        ))}
      </Tabs>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "approve" ? "Approve Appointment" : "Reassign Caregiver"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Only show caregiver selection if needed */}
            {(modalType === "reassign" || (modalType === "approve" && !selectedAppointment?.caregiver)) && (
              <Form.Group className="mb-3">
                <Form.Label>Select Caregiver</Form.Label>
                <Form.Select
                  name="caregiver"
                  value={formData.caregiver}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">-- Select --</option>
                  {getFilteredCaregivers().map((cg) => (
                    <option value={cg._id} key={cg._id}>
                      {cg.firstName} {cg.lastName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            {/* Only show date/time fields for approval */}
            {modalType === "approve" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Appointment Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={modalType === "approve" ? handleApprove : handleReassign}
          >
            {modalType === "approve" ? "Approve" : "Reassign"}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
    </div>
  );
};

export default Appointments;