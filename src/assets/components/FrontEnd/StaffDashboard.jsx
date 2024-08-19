import React, { useState, useEffect } from 'react';
import { MdOutlineSpaceDashboard } from 'react-icons/md';
import { RiFileMusicLine } from 'react-icons/ri';
import { IoIosLogOut } from 'react-icons/io';
import { BiEdit } from 'react-icons/bi';
import { CiFlag1 } from 'react-icons/ci';
import { FaRegTrashAlt } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CommentsTable from './CommentsTable';  // Import the new component

function WelcomeCard() {
  const cardStyle = {
    backgroundColor: '#0056b3',
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    fontFamily: 'Futura, sans-serif',
  };

  const titleStyle = {
    fontSize: '26px',
    fontWeight: 'bold',
    marginBottom: '10px',
  };

  const descriptionStyle = {
    fontSize: '16px',
    marginBottom: '20px',
  };

  const buttonStyle = {
    backgroundColor: 'white',
    color: '#0056b3',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  };

  return (
    <div style={cardStyle}>
      <div className="welcome-card-content">
        <h2 className="welcome-card-title" style={titleStyle}>
          Explore Your Dashboard
        </h2>
        <p className="welcome-card-description" style={descriptionStyle}>
          Welcome to the Staff Dashboard. Manage your content efficiently.
        </p>
        <button style={buttonStyle}>Get Started</button>
      </div>
    </div>
  );
}

function ContentCard({ content, onEdit, onApprove, onFlag, onDelete }) {
  const cardStyle = {
    backgroundColor: 'white',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'Futura, sans-serif',
  };

  const imgStyle = {
    width: '150px',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '50%',
    marginBottom: '16px',
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
  };

  const descriptionStyle = {
    fontSize: '14px',
    color: '#333',
    marginBottom: '10px',
  };

  const buttonStyle = {
    border: 'none',
    cursor: 'pointer',
    margin: '0 5px',
    fontSize: '14px',
  };

  const editButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white',
  };

  const approveButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#28a745',
    color: 'white',
  };

  const flagButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#fd7e14',
    color: 'white',
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
    color: 'white',
  };

  return (
    <div style={cardStyle}>
      <img
        src={content.image_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5MtRrZ5ntzJhuyc5yg8q707E7AzRDTEgdLQ&s"}
        alt={content.title}
        style={imgStyle}
      />
      <div className="content-details">
        <h4 style={titleStyle}>{content.title}</h4>
        <p style={descriptionStyle}>{content.description}</p>
        {content.content_url && (
          <a href={content.content_url} target="_blank" rel="noopener noreferrer" style={{ color: '#0056b3', textDecoration: 'underline' }}>
            View More
          </a>
        )}
      </div>
      <div className="content-actions" style={{ marginTop: '16px' }}>
        <button onClick={() => onEdit(content)} style={editButtonStyle} aria-label="Edit Content">
          <BiEdit /> Edit
        </button>
        <button onClick={() => onApprove(content.id)} style={approveButtonStyle} aria-label="Approve Content">
          <CiFlag1 /> Approve
        </button>
        <button onClick={() => onFlag(content.id)} style={flagButtonStyle} aria-label="Flag Content">
          <CiFlag1 /> Flag
        </button>
        <button onClick={() => onDelete(content.id)} style={deleteButtonStyle} aria-label="Delete Content">
          <FaRegTrashAlt /> Delete
        </button>
      </div>
    </div>
  );
}
function StaffDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [contentData, setContentData] = useState({
    id: "",
    title: "",
    description: "",
    content_url: "",
    image_url: "",
  });
  const [contentList, setContentList] = useState([]);
  const [comments, setComments] = useState([]);  // State for comments

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("http://localhost:5000/admin/content");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setContentList(data);
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await fetch("http://localhost:5000/staff/comments");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchContent();
    fetchComments();
  }, []);

  const handleRequest = async (url, method, body = null) => {
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null,
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error with ${method} request:`, error);
      throw error;
    }
  };

  const handleCreateContent = async (e) => {
    e.preventDefault();
    try {
      const response = await handleRequest("http://localhost:5000/staff/content", 'POST', contentData);
      setContentList([...contentList, response]);
      toast.success("Content created successfully!");
      handleCloseModal();
    } catch (error) {
      toast.error("Error creating content.");
      console.error("Error creating content:", error.message);
    }
  };

  const handleEditContent = async (e) => {
    e.preventDefault();
    try {
      const response = await handleRequest(`http://localhost:5000/staff/content/${contentData.id}`, 'PATCH', contentData);
      setContentList(contentList.map(content => content.id === contentData.id ? response : content));
      toast.success("Content updated successfully!");
      handleCloseModal();
    } catch (error) {
      toast.error("Error updating content.");
      console.error("Error editing content:", error.message);
    }
  };

  const handleApproveContent = async (contentId) => {
    try {
      const response = await handleRequest(`http://localhost:5000/staff/content/${contentId}/approve`, 'PATCH', { approved_by: 'admin_user' });
      setContentList(contentList.map(content => content.id === contentId ? response : content));
      toast.success("Content approved successfully!");
    } catch (error) {
      toast.error("Error approving content.");
      console.error("Error approving content:", error.message);
    }
  };

  const handleFlagContent = async (contentId) => {
    try {
      const response = await handleRequest(`http://localhost:5000/staff/content/${contentId}/flag`, 'PATCH');
      setContentList(contentList.map(content => content.id === contentId ? response : content));
      toast.success("Content flagged successfully!");
    } catch (error) {
      toast.error("Error flagging content.");
      console.error("Error flagging content:", error.message);
    }
  };

  const handleDeleteContent = async (contentId) => {
    try {
      await handleRequest(`http://localhost:5000/staff/content/${contentId}`, 'DELETE');
      setContentList(contentList.filter(content => content.id !== contentId));
      toast.success("Content deleted successfully!");
    } catch (error) {
      toast.error("Error deleting content.");
      console.error("Error deleting content:", error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await handleRequest(`http://localhost:5000/staff/comments/${commentId}`, 'DELETE');
      setComments(comments.filter(comment => comment.id !== commentId));
      toast.success("Comment deleted successfully!");
    } catch (error) {
      toast.error("comment deleted.");
      console.error("comment deleted", error.message);
    }
  };


  const handleOpenModal = (type, content = {}) => {
    setModalType(type);
    setContentData(content);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setContentData({ id: "", title: "", description: "", content_url: "", image_url: "" });
  };

  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setContentData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    window.location.href = '/logout';
  };

  return (
    <div style={{ display: 'flex' }}>
      <ToastContainer />
      <div style={{ width: '250px', backgroundColor: '#343a40', color: 'white', padding: '20px' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Logo</div>
        <div onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer', marginBottom: '10px' }}>
          <MdOutlineSpaceDashboard style={{ fontSize: '24px', marginRight: '10px' }} />
          <span>Home</span>
        </div>
        <div onClick={() => window.location.href = '/content'} style={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer', marginBottom: '10px' }}>
          <RiFileMusicLine style={{ fontSize: '24px', marginRight: '10px' }} />
          <span>Content</span>
        </div>
        <div onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
          <IoIosLogOut style={{ fontSize: '24px', marginRight: '10px' }} />
          <span>Logout</span>
        </div>
      </div>
      <div style={{ flex: 1, padding: '20px' }}>
        <WelcomeCard />
        <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {contentList.length > 0 ? (
            contentList.map(content => (
              <ContentCard
                key={content.id}
                content={content}
                onEdit={handleOpenModal.bind(null, 'editContent')}
                onApprove={handleApproveContent}
                onFlag={handleFlagContent}
                onDelete={handleDeleteContent}
              />
            ))
          ) : (
            <p>No content available.</p>
          )}
        </div>
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '500px' }}>
              <button onClick={handleCloseModal} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }} aria-label="Close Modal">
                &times;
              </button>
              <h2 style={{ fontFamily: 'Futura, sans-serif', fontSize: '24px', marginBottom: '20px' }}>{modalType === 'editContent' ? "Edit Content" : "Create Content"}</h2>
              <form onSubmit={modalType === 'editContent' ? handleEditContent : handleCreateContent}>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  Title:
                  <input
                    type="text"
                    name="title"
                    value={contentData.title}
                    onChange={handleContentChange}
                    required
                    style={{ display: 'block', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '16px' }}
                  />
                </label>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  Description:
                  <textarea
                    name="description"
                    value={contentData.description}
                    onChange={handleContentChange}
                    required
                    style={{ display: 'block', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '16px' }}
                  />
                </label>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  Link:
                  <input
                    type="url"
                    name="content_url"
                    value={contentData.content_url}
                    onChange={handleContentChange}
                    style={{ display: 'block', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '16px' }}
                    pattern="https://.*"
                    placeholder="https://example.com"
                  />
                </label>
                <label style={{ display: 'block', marginBottom: '20px' }}>
                  Image URL:
                  <input
                    type="url"
                    name="image_url"
                    value={contentData.image_url}
                    onChange={handleContentChange}
                    style={{ display: 'block', width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '16px' }}
                    pattern="https://.*"
                    placeholder="https://example.com/image.jpg"
                  />
                </label>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="submit" style={{ backgroundColor: '#0056b3', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', fontSize: '16px' }}>
                    {modalType === 'editContent' ? "Save Changes" : "Create Content"}
                  </button>
                  <button type="button" onClick={handleCloseModal} style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', fontSize: '16px' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    
        {/* Add the CommentsTable component here */}
        <CommentsTable comments={comments} onDelete={handleDeleteComment} />
      </div>
    </div>
  );
}

export default StaffDashboard;