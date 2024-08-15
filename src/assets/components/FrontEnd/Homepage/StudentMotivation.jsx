import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import image from '../image/Premium Vector _ Hand drawn back to school illustration.jpeg';
import AdminDashboard from '../AdminDashboard';
import StudentDashboard from '../StudentDashboard';
import StaffDashboard from '../StaffDashboard';

const StudentMotivation = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate(); // Use useNavigate hook to programmatically navigate

  const handleButtonClick = (type) => {
    if (type === 'admin') {
      setShowModal(true);
      setModalType('login');
      setUserType('Admin');
    } else {
      setShowModal(true);
      setModalType(type);
      setUserType('');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleRoleSelect = (type) => {
    setUserType(type);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let url = '';
    let bodyData = {};

    if (modalType === 'signup') {
      url = 'http://localhost:3000/users'; // Replace with your Flask signup endpoint
      bodyData = {
        username: formData.userName,
        email: formData.email,
        password: formData.password,
        role: userType.toLowerCase()
      };
    } else if (modalType === 'login') {
      url = 'http://localhost:3000/login'; // Replace with your Flask login endpoint
      bodyData = {
        email: formData.email,
        password: formData.password
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      const contentType = response.headers.get('Content-Type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text(); // Read response as text if not JSON
      }

      if (response.ok) {
        alert(`${modalType === 'signup' ? 'Sign Up' : 'Login'} successful!`);
        if (modalType === 'login') {
          if (userType === 'Admin') {
            navigate('/admin-dashboard'); // Redirect to the AdminDashboard
          } else if (userType === 'Student') {
            navigate('/student-dashboard'); // Redirect to the StudentDashboard
          } else if (userType === 'Staff') {
            navigate('/staff-dashboard'); // Redirect to the StaffDashboard
          }
        }
      } else {
        alert(`Error: ${data}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    } finally {
      handleCloseModal();
    }
  };

  return (
    <div className="landing-page">
      <header className="headers">
        <div className="logo">TeckStudy</div>
        <nav className="navigation">
          <a href="#" onClick={() => handleButtonClick('admin')}>Admin</a>
          <a href="#">About Us</a>
          <button onClick={() => handleButtonClick('signup')}>SignUp</button>
          <button onClick={() => handleButtonClick('login')}>LogIn</button>
        </nav>
        <div className="menu-icon">&#9776;</div>
      </header>

      <section className="main-contents">
        <div className="image-container">
          <img src={image} alt="Coworking Illustration" />
        </div>
        <div className="text-content">
          <h1>You Can Do This</h1>
          <p>
            <strong>About Us:</strong> Welcome to TeckStudy—your portal to the world of technology.
            Our mission at TeckStudy is to provide students with reliable and inspiring resources, connecting them directly to the pulse of the tech industry.
            <br />
            <strong>What We Offer:</strong>
            Exclusive Interviews: Engage with tech industry leaders, Moringa school alumni, and our expert staff through insightful video and audio interviews.
            Engaging Articles: Stay informed with articles that demystify tech concepts, cover the latest trends, and offer career advice.
            Diverse Multimedia Content: Choose from videos, podcasts, or detailed articles to match your preferred learning style.
            Join Our Community: Enhance your tech knowledge and network with us. Every piece of content is designed to broaden your understanding and connect you with the tech world.
            Explore TeckStudy today and discover your tech potential tomorrow
          </p>

          <h2>The secret to your future is hidden in your daily routine.</h2>
        </div>
      </section>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={handleCloseModal}>
              &times;
            </span>
            {modalType === 'admin' ? (
              <form onSubmit={handleSubmit}>
                <h3>Admin Login</h3>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="submit">Login</button>
              </form>
            ) : modalType === 'login' && userType ? (
              <form onSubmit={handleSubmit}>
                <h3>Login as {userType}</h3>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="submit">Login</button>
              </form>
            ) : userType ? (
              <form onSubmit={handleSubmit}>
                <h3>Sign Up as {userType}</h3>
                <input
                  type="text"
                  name="userName"
                  placeholder="User Name"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="submit">Submit</button>
              </form>
            ) : (
              <>
                <h3>Select Your Role ({modalType})</h3>
                <button onClick={() => handleRoleSelect('Staff')}>Staff</button>
                <button onClick={() => handleRoleSelect('Student')}>Student</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<StudentMotivation />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/staff-dashboard" element={<StaffDashboard />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
    </Routes>
  </Router>
);

export default App;
//student motivation