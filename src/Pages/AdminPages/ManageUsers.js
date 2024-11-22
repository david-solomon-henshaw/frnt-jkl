import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";
import UserCard from "../../Components/UserCard";
import { FaUserPlus, FaUserEdit, FaUserTimes } from "react-icons/fa";
import CreateCaregiverModal from "../../Components/CreateCaregiverModal";
import CreateAdminModal from "../../Components/CreateAdminModal";
import EditCaregiverModal from "../../Components/EditCaregiverModal"; // New modal for editing caregivers
import DeleteCaregiverModal from "../../Components/DeleteCaregiverModal"; // New modal for deleting caregivers

const ManageUsers = () => {
  const [showCreateCaregiverModal, setShowCreateCaregiverModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showEditCaregiverModal, setShowEditCaregiverModal] = useState(false); // State for edit modal
  const [showDeleteCaregiverModal, setShowDeleteCaregiverModal] = useState(false); // State for delete modal
  const [selectedDepartment, setSelectedDepartment] = useState(""); // Track selected department

  const handleEditCaregivers = (department) => {
    setSelectedDepartment(department); // Set the selected department
    setShowEditCaregiverModal(true); // Show modal
  };

  return (
    <div className="p-4">
      <h2 className="text-left mb-4 font-weight-bold">Manage Users</h2>
      <Row>
        <Col md={4}>
          <UserCard
            title="Create Caregiver"
            text="Add a new caregiver to the system."
            icon={<FaUserPlus size={40} className="text-primary mb-3" />}
            onClick={() => setShowCreateCaregiverModal(true)}
            variant="primary"
          />
        </Col>
        <Col md={4}>
          <UserCard
            title="Create Admin"
            text="Add a new admin to the system."
            icon={<FaUserPlus size={40} className="text-success mb-3" />}
            onClick={() => setShowCreateAdminModal(true)}
            variant="success"
          />
        </Col>
        <Col md={4}>
          <UserCard
            title="Edit Caregiver"
            text="Edit caregivers based on their department."
            icon={<FaUserEdit size={40} className="text-info mb-3" />}
            onClick={() => handleEditCaregivers("Pediatrics")} // Example department
            variant="info"
          />
        </Col>
        <Col md={4}>
          <UserCard
            title="Delete Caregiver"
            text="Delete a caregiver from the system."
            icon={<FaUserTimes size={40} className="text-dark mb-3" />}
            onClick={() => setShowDeleteCaregiverModal(true)}
            variant="dark"
          />
        </Col>
      </Row>

      <CreateCaregiverModal
        show={showCreateCaregiverModal}
        handleClose={() => setShowCreateCaregiverModal(false)}
      />
      <CreateAdminModal
        show={showCreateAdminModal}
        handleClose={() => setShowCreateAdminModal(false)}
      />
      <EditCaregiverModal
        show={showEditCaregiverModal}
        handleClose={() => setShowEditCaregiverModal(false)}
        department={selectedDepartment} // Pass the selected department to modal
      />
      <DeleteCaregiverModal
        show={showDeleteCaregiverModal}
        handleClose={() => setShowDeleteCaregiverModal(false)}
      />
    </div>
  );
};

export default ManageUsers;
