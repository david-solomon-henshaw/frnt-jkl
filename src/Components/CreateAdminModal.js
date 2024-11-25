import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal, Form, Alert, Toast } from 'react-bootstrap';
import axios from 'axios';

const CreateAdminModal = ({ show, handleClose }) => {
  const [adminData, setAdminData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: '', // 'success' or 'danger'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const firstNameRef = useRef();

  useEffect(() => {
    if (show) {
      firstNameRef.current.focus();
    }
  }, [show]);

  const validate = () => {
    const errors = {};
    
    // First Name Validation
    if (!adminData.firstName) errors.firstName = 'First name is required';
    
    // Last Name Validation
    if (!adminData.lastName) errors.lastName = 'Last name is required';
    
    // Email Validation
    if (!adminData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(adminData.email)) {
      errors.email = 'Email is invalid';
    }
  
   
  // Regex for password rules
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

   // Password Validation
   if (!adminData.password) {
    errors.password = 'Password is required';
  } else if (!passwordPattern.test(adminData.password)) {
    errors.password = 'Password must be at least 8 characters long, include one lowercase letter, one uppercase letter, one number, and one special character';
  }

  // Confirm Password Validation
  if (adminData.password !== adminData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
  };
  
  const getPasswordError = () => {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  
    if (touched.password) {
      if (!adminData.password) return 'Password is required';
      if (!passwordPattern.test(adminData.password)) {
        return 'Password must be at least 8 characters long, include one lowercase letter, one uppercase letter, one number, and one special character';
      }
    }
    return '';
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setAlert({
        show: true,
        message: 'Please fix the errors before submitting.',
        type: 'danger',
      });
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/admin/register`, {
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        email: adminData.email,
        password: adminData.password,
      });

      setAdminData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      setAlert({
        show: true,
        message: 'Admin created successfully!',
        type: 'success',
      });

      setShowSuccessToast(true);
      setTimeout(() => {
        handleClose();
        setShowSuccessToast(false);
      }, 2000);

    } catch (error) {
      console.error(error.response?.data?.message || error);
      setAlert({
        show: true,
        message: error.response?.data?.message || 'Something went wrong.',
        type: 'danger',
      });
      setShowErrorToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const [showPassword, setShowPassword] = useState(false);

  const isFormValid = () => {
    const errors = validate();
    return Object.keys(errors).length === 0;
  };

  const isPasswordInvalid = touched.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(adminData.password);
  return (
    <>
      {showSuccessToast && (
        <Toast>
          <Toast.Body>Admin created successfully!</Toast.Body>
        </Toast>
      )}

      {showErrorToast && (
        <Toast>
          <Toast.Body>{alert.message}</Toast.Body>
        </Toast>
      )}

      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alert.show && (
            <Alert variant={alert.type} aria-live="polite" onClose={() => setAlert({ ...alert, show: false })} dismissible>
              {alert.message}
            </Alert>
          )}
          <Form onSubmit={handleCreateAdmin}>
            <Form.Group controlId="formFirstName" className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                ref={firstNameRef}
                type="text"
                placeholder="Enter first name"
                value={adminData.firstName}
                onChange={(e) => setAdminData({ ...adminData, firstName: e.target.value })}
                onBlur={() => setTouched({ ...touched, firstName: true })}
                isInvalid={touched.firstName && !adminData.firstName}
              />
              <Form.Control.Feedback type="invalid">
                First name is required
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formLastName" className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter last name"
                value={adminData.lastName}
                onChange={(e) => setAdminData({ ...adminData, lastName: e.target.value })}
                onBlur={() => setTouched({ ...touched, lastName: true })}
                isInvalid={touched.lastName && !adminData.lastName}
              />
              <Form.Control.Feedback type="invalid">
                Last name is required
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={adminData.email}
                onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                onBlur={() => setTouched({ ...touched, email: true })}
                isInvalid={touched.email && (!adminData.email || !/\S+@\S+\.\S+/.test(adminData.email))}
              />
              <Form.Control.Feedback type="invalid">
                {touched.email && !adminData.email ? 'Email is required' : ''}
                {touched.email && adminData.email && !/\S+@\S+\.\S+/.test(adminData.email) ? 'Email is invalid' : ''}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={adminData.password}
                  onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  isInvalid={isPasswordInvalid}
                />
                <Button 
                  variant="link" 
                  onClick={togglePasswordVisibility}
                  className="position-absolute end-0 top-0"
                  style={{ height: '100%', zIndex: 1 }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
                <Form.Control.Feedback type="invalid">
                  {getPasswordError()}
                </Form.Control.Feedback>
              </div>
            </Form.Group>

            <Form.Group controlId="formConfirmPassword" className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={adminData.confirmPassword}
                onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                isInvalid={touched.confirmPassword && adminData.password !== adminData.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                Passwords do not match
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant="success" type="submit" disabled={isLoading || !isFormValid()} className="mt-3">
              {isLoading ? 'Creating...' : 'Create Admin'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CreateAdminModal;