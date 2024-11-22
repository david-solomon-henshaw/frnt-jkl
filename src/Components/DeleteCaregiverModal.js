import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner, Alert, ListGroup, Dropdown, Row, Col } from "react-bootstrap";
import axios from "axios";

const DeleteCaregiverModal = ({ show, handleClose }) => {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [filteredCaregivers, setFilteredCaregivers] = useState([]);

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

  // Delete caregiver by ID
  const deleteCaregiver = async (caregiverId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/caregivers/${caregiverId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove the deleted caregiver from the filtered list
      setFilteredCaregivers(filteredCaregivers.filter(c => c._id !== caregiverId));
      alert(response.data.message); // Optional: alert the user
    } catch (err) {
      alert(err.message || "An error occurred while deleting caregiver");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Delete Caregiver</Modal.Title>
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
                {/* Caregiver List */}
                <Row className="mt-3">
                  {filteredCaregivers.length > 0 ? (
                    filteredCaregivers.map((caregiver) => (
                      <Col key={caregiver._id} md={6} lg={4} className="mb-3">
                        <ListGroup>
                          <ListGroup.Item>
                            <strong>
                              {caregiver.firstName} {caregiver.lastName}
                            </strong> - {caregiver.department}
                            <Button
                              variant="outline-danger"
                              onClick={() => deleteCaregiver(caregiver._id)}
                              size="sm"
                              className="ml-3"
                            >
                              Delete
                            </Button>
                          </ListGroup.Item>
                        </ListGroup>
                      </Col>
                    ))
                  ) : (
                    <p>No caregivers available in this department.</p>
                  )}
                </Row>
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

export default DeleteCaregiverModal;
