import React, { useState, useEffect } from "react";
import { CiFlag1, CiUser } from "react-icons/ci";
import { FcApprove } from "react-icons/fc";
import { IoIosLogOut } from "react-icons/io";
import { IoAddCircleOutline } from "react-icons/io5";
import { TiUserAdd } from "react-icons/ti";
import { HiOutlineUserRemove } from "react-icons/hi";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { GiToken } from "react-icons/gi";
import Modal from 'react-modal';
import './AdminDashboard.css';

function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [userType, setUserType] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [contentType, setContentType] = useState("");
  const [contentData, setContentData] = useState({
    title: "",
    description: "",
    link: "",
    thumbnail: "",
    file: null,
    category: "" // Added category field
  });
  const [categoryData, setCategoryData] = useState({ name: "", description: "" });
  const [users, setUsers] = useState([]);
  const [contentList, setContentList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]); // To hold category data
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [role, setRole] = useState('Admin');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalContent, setTotalContent] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [flagReason, setFlagReason] = useState("");
  const [contentId, setContentId] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    setUserId(storedUserId);
    setLoading(true);
    fetchUsers();
    fetchContent();
    fetchCategories();
    fetchAnalytics();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://motivation-ptatform-1.onrender.com/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async () => {
    try {
      const response = await fetch('https://motivation-ptatform-1.onrender.com/admin/content');
      const data = await response.json();
      setContentList(data);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://motivation-ptatform-1.onrender.com/admin/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('https://motivation-ptatform-1.onrender.com/admin/analytics');
      const data = await response.json();
      setTotalUsers(data.totalUsers);
      setTotalStaff(data.totalStaff);
      setTotalStudents(data.totalStudents);
      setTotalContent(data.totalContent);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setUserType("");
    setUserName("");
    setUserId("");
    setContentType("");
    setContentData({
      title: "",
      description: "",
      link: "",
      thumbnail: "",
      file: null,
      category: ""
    });
    setCategoryData({ name: "", description: "" });
    setSelectedCategory("");
    setFlagReason("");
    setContentId("");
  };

  const handleUserTypeChange = (e) => setUserType(e.target.value);
  const handleUserNameChange = (e) => setUserName(e.target.value);
  const handleUserIdChange = (e) => setUserId(e.target.value);
  const handleContentChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setContentData(prevData => ({ ...prevData, [name]: files[0] }));
    } else {
      setContentData(prevData => ({ ...prevData, [name]: value }));
    }
  };
  
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://motivation-ptatform-1.onrender.com/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userName,
          email: `${userName}@gmail.com`,
          password_hash: 'default_password',
          role: userType
        })
      });
      if (response.ok) {
        fetchUsers();
        setMessage("User added successfully.");
      } else {
        setMessage("Error adding user.");
      }
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(contentData).forEach(key => formData.append(key, contentData[key]));
    
    setLoading(true);
    try {
      const response = await fetch('https://motivation-ptatform-1.onrender.com/admin/content', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        fetchContent();
        setMessage("Content added successfully.");
      } else {
        setMessage("Error adding content.");
      }
    } catch (error) {
      console.error("Error adding content:", error);
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://motivation-ptatform-1.onrender.com/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryData.name,
          description: categoryData.description,
          created_by: userId,
        })
      });
      if (response.ok) {
        fetchCategories();
        setMessage("Category added successfully.");
      } else {
        setMessage("Error adding category.");
      }
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      handleCloseModal();
    }
  };

  const handleDeactivateUser = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`https://motivation-ptatform-1.onrender.com/admin/users/${userId}/deactivate`, {
        method: 'PATCH'
      });
      if (response.ok) {
        fetchUsers();
        setMessage("User deactivated successfully.");
      } else {
        setMessage("Error deactivating user.");
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveContent = async (contentId) => {
    setLoading(true);
    try {
      const response = await fetch(`https://motivation-ptatform-1.onrender.com/admin/content/${contentId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_by: userId })
      });
      if (response.ok) {
        fetchContent();
        setMessage("Content approved successfully.");
      } else {
        setMessage("Error approving content.");
      }
    } catch (error) {
      console.error("Error approving content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlagContent = (contentId) => {
    setIsModalOpen(true);
    setModalType("flag");
    setContentId(contentId);
  };

  
  const handleSubmitFlag = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`https://motivation-ptatform-1.onrender.com/admin/content/${contentId}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: flagReason })
      });
      if (response.ok) {
        fetchContent();
        setMessage("Content flagged successfully.");
      } else {
        setMessage("Error flagging content.");
      }
    } catch (error) {
      console.error("Error flagging content:", error);
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };


  const handleRemoveContent = async (contentId) => {
    setLoading(true);
    try {
      const response = await fetch(`https://motivation-ptatform-1.onrender.com/staff/content/${contentId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchContent();
        setMessage("Content removed successfully.");
      } else {
        setMessage("Error removing content.");
      }
    } catch (error) {
      console.error("Error removing content:", error);
    } finally {
      setLoading(false);
    }
  };

  {modalType === "flag" && (
    <form onSubmit={handleSubmitFlag}>
      <h2>Flag Content</h2>
      <label>
        Reason:
        <textarea value={flagReason} onChange={(e) => setFlagReason(e.target.value)} required />
      </label>
      <button type="submit">Submit Flag</button>
    </form>
  )}



  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredContent = contentList.filter(content => content.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <nav>
          <ul>
            <li className="sidebar-item" onClick={() => window.location.href = '/'}>
              <MdOutlineSpaceDashboard className="sidebar-icon" />
              <span className="sidebar-text">Home</span>
            </li>
            <li className="sidebar-item" onClick={() => { setModalType("user"); setIsModalOpen(true); }}>
              <TiUserAdd className="sidebar-icon" />
              <span className="sidebar-text">Add User</span>
            </li>
          
            <li className="sidebar-item" onClick={() => { setModalType("category"); setIsModalOpen(true); }}>
              <GiToken className="sidebar-icon" />
              <span className="sidebar-text">Add Category</span>
            </li>
            <li className="sidebar-item" onClick={() => window.location.href = '/'}>
              <IoIosLogOut className="sidebar-icon" />
              <span className="sidebar-text">Logout</span>
            </li>
          </ul>
        </nav>
      </div>
      <div className="main-content">
        <div className="greeting-section">
          <h1>Hello, {role}</h1>
        </div>
        <div className="analytics-cards">
          <div className="card">Total Users: {totalUsers}</div>
          <div className="card">Total Staff: {totalStaff}</div>
          <div className="card">Total Students: {totalStudents}</div>
          <div className="card">Total Content: {totalContent}</div>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="content-list">
          <h2>Users</h2>
          {loading ? <p>Loading...</p> : (
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.created_at}</td>
                    <td>
                     
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="content-list">
          <h2>Content</h2>
          {loading ? <p>Loading...</p> : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContent.map(content => (
                  <tr key={content.id}>
                    <td>{content.title}</td>
                    <td>{content.description}</td>
                    <td>{content.category}</td>
                    <td>
                      {/* {!content.approved_by && (
                        <button
                          onClick={() => handleApproveContent(content.id)}
                          style={{
                            backgroundColor: 'green',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <FcApprove /> Approve
                        </button>
                      )} */}
                      <button
                        onClick={() => handleFlagContent(content.id)}
                        style={{
                          backgroundColor: 'orange',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginLeft: '8px'
                        }}
                      >
                        
                        <CiFlag1 /> Flag
                      </button>
                      <button
                        onClick={() => handleRemoveContent(content.id)}
                        style={{
                          backgroundColor: 'red',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginLeft: '8px'
                        }}
                      >
                        <HiOutlineUserRemove /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onRequestClose={handleCloseModal} className="modal" overlayClassName="overlay">
        <h2>{modalType === "user" ? "Add User" : modalType === "content" ? "Add Content" : modalType === "category" ? "Add Category" : ""}</h2>
        {modalType === "user" && (
          <form onSubmit={handleAddUser}>
            <label>
              User Type:
              <select value={userType} onChange={handleUserTypeChange}>
                <option value="">Select</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="student">Student</option>
              </select>
            </label>
            <label>
              User Name:
              <input type="text" value={userName} onChange={handleUserNameChange} required />
            </label>
            <button type="submit">Add User</button>
          </form>
        )}
        {modalType === "content" && (
          <form onSubmit={handleAddContent}>
            <label>
              Title:
              <input type="text" name="title" value={contentData.title} onChange={handleContentChange} required />
            </label>
            <label>
              Description:
              <textarea name="description" value={contentData.description} onChange={handleContentChange} required />
            </label>
            <label>
              Link:
              <input type="text" name="link" value={contentData.link} onChange={handleContentChange} />
            </label>
            <label>
              Thumbnail:
              <input type="text" name="thumbnail" value={contentData.thumbnail} onChange={handleContentChange} />
            </label>
            <label>
              File:
              <input type="file" name="file" onChange={handleContentChange} />
            </label>
            <label>
              Category:
              <select name="category" value={contentData.category} onChange={handleContentChange} required>
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </label>
            <button type="submit">Add Content</button>
          </form>
        )}
        {modalType === "category" && (
          <form onSubmit={handleAddCategory}>
            <label>
              Category Name:
              <input type="text" name="name" value={categoryData.name} onChange={handleCategoryChange} required />
            </label>
            <label>
              Description:
              <textarea name="description" value={categoryData.description} onChange={handleCategoryChange} />
            </label>
            <button type="submit">Add Category</button>
          </form>
        )}
        <button onClick={handleCloseModal}>Close</button>
        {modalType === "flag" && (
          <form onSubmit={handleSubmitFlag}>
            <h2>Flag Content</h2>
            <label>
              Reason:
              <textarea value={flagReason} onChange={(e) => setFlagReason(e.target.value)} required />
            </label>
            <button type="submit">Submit Flag</button>
          </form>
        )}
      </Modal>
      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default AdminDashboard;
