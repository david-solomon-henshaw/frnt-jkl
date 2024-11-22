import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner, Alert, ListGroup, Dropdown, Tab, Tabs, Row, Col } from "react-bootstrap";
import axios from "axios";

const EditCaregiverModal = ({ show, handleClose }) => {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [filteredCaregivers, setFilteredCaregivers] = useState([]);
  const [activeTab, setActiveTab] = useState("available"); // Track active tab

  // Fetch caregivers when the modal is opened
  useEffect(() => {
    if (show) {
      const fetchCaregivers = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token"); // Get token from localStorage
          if (!token) {
            throw new Error("No authentication token found");
          }

          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/admin/caregivers`,
            {
              headers: {
                Authorization: `Bearer ${token}`, // Add token to the Authorization header
              },
            }
          );

          setCaregivers(response.data); // Assuming response is an array of caregivers
        } catch (err) {
          setError(err.message || "An error occurred while fetching caregivers");
        } finally {
          setLoading(false);
        }
      };

      fetchCaregivers();
    }
  }, [show]);

  // Extract unique departments from caregivers
  const departments = [...new Set(caregivers.map(c => c.department))];

  // Handle department change to filter caregivers
  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);
    setFilteredCaregivers(caregivers.filter(c => c.department === dept));
  };

  // Toggle availability of caregiver
  const toggleAvailability = async (caregiverId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const caregiverToUpdate = filteredCaregivers.find(c => c._id === caregiverId);
      const updatedCaregiver = {
        ...caregiverToUpdate,
        available: !caregiverToUpdate.available,
      };

      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/caregivers/${caregiverId}`,
        { available: updatedCaregiver.available },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedCaregivers = filteredCaregivers.map(c =>
        c._id === caregiverId ? { ...c, available: updatedCaregiver.available } : c
      );

      setFilteredCaregivers(updatedCaregivers);
      alert(response.data.message); // Optional: alert the user
    } catch (err) {
      alert(err.message || "An error occurred while updating caregiver availability");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Caregiver Availability</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Loading caregivers...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            {/* Department Dropdown */}
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-department">
                {selectedDepartment || "Select Department"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {departments.map((dept) => (
                  <Dropdown.Item key={dept} onClick={() => handleDepartmentChange(dept)}>
                    {dept}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            {selectedDepartment && (
              <>
                {/* Tabs for Available and Unavailable Caregivers */}
                <Tabs
                  id="caregiver-tabs"
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mt-3"
                >
                  <Tab eventKey="available" title="Available Caregivers">
                    <Row className="mt-3">
                      {filteredCaregivers.filter(c => c.available).length > 0 ? (
                        filteredCaregivers.filter(c => c.available).map((caregiver) => (
                          <Col key={caregiver._id} md={6} lg={4} className="mb-3">
                            <ListGroup>
                              <ListGroup.Item>
                                <strong>
                                  {caregiver.firstName} {caregiver.lastName}
                                </strong>{" "}
                                - {caregiver.department} -{" "}
                                <span style={{ color: "green" }}>Available</span>
                                <Button
                                  variant="outline-secondary"
                                  onClick={() => toggleAvailability(caregiver._id)}
                                  size="sm"
                                  className="ml-3"
                                >
                                  Toggle Availability
                                </Button>
                              </ListGroup.Item>
                            </ListGroup>
                          </Col>
                        ))
                      ) : (
                        <p>No available caregivers in this department.</p>
                      )}
                    </Row>
                  </Tab>
                  <Tab eventKey="unavailable" title="Unavailable Caregivers">
                    <Row className="mt-3">
                      {filteredCaregivers.filter(c => !c.available).length > 0 ? (
                        filteredCaregivers.filter(c => !c.available).map((caregiver) => (
                          <Col key={caregiver._id} md={6} lg={4} className="mb-3">
                            <ListGroup>
                              <ListGroup.Item>
                                <strong>
                                  {caregiver.firstName} {caregiver.lastName}
                                </strong>{" "}
                                - {caregiver.department} -{" "}
                                <span style={{ color: "red" }}>Unavailable</span>
                                <Button
                                  variant="outline-secondary"
                                  onClick={() => toggleAvailability(caregiver._id)}
                                  size="sm"
                                  className="ml-3"
                                >
                                  Toggle Availability
                                </Button>
                              </ListGroup.Item>
                            </ListGroup>
                          </Col>
                        ))
                      ) : (
                        <p>No unavailable caregivers in this department.</p>
                      )}
                    </Row>
                  </Tab>
                </Tabs>
              </>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditCaregiverModal;
