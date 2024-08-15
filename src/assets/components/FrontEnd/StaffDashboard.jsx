import React, { useState, useEffect } from 'react';
import { MdOutlineSpaceDashboard } from 'react-icons/md';
import { TiUserAdd } from 'react-icons/ti';
import { RiFileMusicLine, RiArticleLine, RiVideoLine } from 'react-icons/ri';
import { IoIosLogOut } from 'react-icons/io';
import { BiEdit } from 'react-icons/bi';
import { CiFlag1 } from 'react-icons/ci';
import { AiOutlineLike, AiOutlineDislike, AiOutlineComment } from 'react-icons/ai';

function StaffDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); 
  const [contentType, setContentType] = useState("");
  const [contentData, setContentData] = useState({
    id: "",
    title: "",
    description: "",
    link: ""
  });
  const [contentList, setContentList] = useState({
    Videos: [],
    Audios: [],
    Articles: []
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedContent, setSelectedContent] = useState(null); 
  const [profileData, setProfileData] = useState({
    name: "",
    UserId: ""
  });
  const [profiles, setProfiles] = useState([]);

  // Fetch stored data from local storage
  useEffect(() => {
    const storedContentList = localStorage.getItem('contentList');
    const storedCategories = localStorage.getItem('categories');
    const storedProfiles = localStorage.getItem('profiles');

    if (storedContentList) {
      setContentList(JSON.parse(storedContentList));
    }
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }
    if (storedProfiles) {
      setProfiles(JSON.parse(storedProfiles));
    }
  }, []);

  // Helper function for API requests
  const handleRequest = async (url, method, body = null) => {
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error with ${method} request:`, error);
      throw error;
    }
  };

  // Handle creating a new profile
  const handleCreateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await handleRequest("http://localhost:3000/users", 'POST', profileData);
      if (response.success) {
        alert("Profile created successfully!");

        const newProfile = {
          name: profileData.name,
          UserId: profileData.UserId,
          id: response.data.id,
        };

        const updatedProfiles = [...profiles, newProfile];
        setProfiles(updatedProfiles);
        localStorage.setItem('profiles', JSON.stringify(updatedProfiles));

        handleCloseModal();
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("An error occurred while creating the profile.");
    }
  };

  // Handle creating new content
  const handleCreateContent = async (e) => {
    e.preventDefault();
    try {
      const response = await handleRequest(`http://localhost:3000/content/${selectedCategory}`, 'POST', contentData);
      if (response.success) {
        const updatedContentList = { 
          ...contentList, 
          [selectedCategory]: [...(contentList[selectedCategory] || []), contentData] 
        };
        localStorage.setItem('contentList', JSON.stringify(updatedContentList));
        setContentList(updatedContentList);
        handleCloseModal();
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (error) {
      console.error("Error creating content:", error.message);
    }
  };

  // Handle editing existing content
  const handleEditContent = async (e) => {
    e.preventDefault();
    try {
      const response = await handleRequest(`http://localhost:3000/content/${contentData.id}`, 'PUT', contentData);
      if (!response.success) throw new Error(`Error: ${response.message}`);

      const updatedContentList = {
        ...contentList,
        [selectedCategory]: contentList[selectedCategory].map(item =>
          item.id === contentData.id ? contentData : item
        )
      };
      localStorage.setItem('contentList', JSON.stringify(updatedContentList));
      setContentList(updatedContentList);
      handleCloseModal();
    } catch (error) {
      console.error("Error editing content:", error.message);
    }
  };

  // Handle opening modals
  const handleOpenModal = (type, content = null) => {
    setModalType(type);
    if (type === 'createContent') {
      setContentType(type);
    }
    if (content) {
      setContentData(content);
      setSelectedContent(content);
    }
    setIsModalOpen(true);
  };

  // Handle closing modals
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setContentType("");
    setContentData({ id: "", title: "", description: "", link: "" });
    setProfileData({ name: "", UserId: "" });
    setSelectedCategory("");
    setSelectedContent(null);
  };

  // Handle changes in content input fields
  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setContentData(prevData => ({ ...prevData, [name]: value }));
  };

  // Handle changes in profile input fields
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({ ...prevData, [name]: value }));
  };

  // Handle changes in category selection
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    const newCategory = prompt("Enter new category name:");
    if (newCategory && !categories.includes(newCategory)) {
      const updatedCategories = [...categories, newCategory];
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';  // Redirect to the homepage
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="logo">Logo</div>
        <div className="sidebar-item">
          <MdOutlineSpaceDashboard className="sidebar-icon" />
          <span className="sidebar-text">Dashboard</span>
        </div>
        <p className="sidebar-item" onClick={() => handleOpenModal('createProfile')}>
          <TiUserAdd className="sidebar-icon" />
          <span className="sidebar-text">Create Profile</span>
        </p>
        <p className="sidebar-item" onClick={() => handleOpenModal('createContent')}>
          <RiFileMusicLine className="sidebar-icon" />
          <span className="sidebar-text">Add Audio</span>
        </p>
        <p className="sidebar-item" onClick={() => handleOpenModal('createContent')}>
          <RiArticleLine className="sidebar-icon" />
          <span className="sidebar-text">Add Article</span>
        </p>
        <p className="sidebar-item" onClick={() => handleOpenModal('createContent')}>
          <RiVideoLine className="sidebar-icon" />
          <span className="sidebar-text">Add Video</span>
        </p>
        <p className="sidebar-item" onClick={handleLogout}>
          <IoIosLogOut className="sidebar-icon"/>
          <span className="sidebar-text">Logout</span>
        </p>
      </div>

      <div className="main-content">
        {Object.keys(contentList).map((category) => (
          <div className={category.toLowerCase()} key={category}>
            <ul>
              {contentList[category].map((content, index) => (
                <li key={index}>
                  <h4>{content.title}</h4>
                  <p>{content.description}</p>
                  {content.link && <a href={content.link} target="_blank" rel="noopener noreferrer">View More</a>}
                  <button onClick={() => handleOpenModal('editContent', content)}>
                    <BiEdit /> Edit
                  </button>
                  <button onClick={async () => {
                    try {
                      await handleRequest(`http://localhost:3000/content/${content.id}`, 'DELETE');
                      const updatedContentList = {
                        ...contentList,
                        [category]: contentList[category].filter(item => item.id !== content.id)
                      };
                      localStorage.setItem('contentList', JSON.stringify(updatedContentList));
                      setContentList(updatedContentList);
                    } catch (error) {
                      console.error("Error deleting content:", error.message);
                    }
                  }}>
                    <CiFlag1 /> Delete
                  </button>
                  <button onClick={async () => {
                    try {
                      await handleRequest(`http://localhost:3000/content/like/${content.id}`, 'POST');
                    } catch (error) {
                      console.error("Error liking content:", error.message);
                    }
                  }}>
                    <AiOutlineLike /> Like
                  </button>
                  <button onClick={async () => {
                    try {
                      await handleRequest(`http://localhost:3000/content/dislike/${content.id}`, 'POST');
                    } catch (error) {
                      console.error("Error disliking content:", error.message);
                    }
                  }}>
                    <AiOutlineDislike /> Dislike
                  </button>
                  <button onClick={async () => {
                    const comment = prompt("Enter comment:");
                    if (comment) {
                      try {
                        await handleRequest(`http://localhost:3000/content/comment/${content.id}`, 'POST', { comment });
                      } catch (error) {
                        console.error("Error commenting on content:", error.message);
                      }
                    }
                  }}>
                    <AiOutlineComment /> Comment
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modalType === 'createProfile' ? "Create Profile" : modalType === 'editContent' ? "Edit Content" : `Create ${contentType}`}</h2>
            <form onSubmit={modalType === 'createProfile' ? handleCreateProfile : modalType === 'editContent' ? handleEditContent : handleCreateContent}>
              {modalType === 'createProfile' && (
                <>
                  <label>
                    Name:
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </label>
                  <label>
                    User ID:
                    <input
                      type="text"
                      name="UserId"
                      value={profileData.UserId}
                      onChange={handleProfileChange}
                      required
                    />
                  </label>
                </>
              )}
              {modalType === 'createContent' && (
                <>
                  <label>
                    Title:
                    <input
                      type="text"
                      name="title"
                      value={contentData.title}
                      onChange={handleContentChange}
                      required
                    />
                  </label>
                  <label>
                    Description:
                    <textarea
                      name="description"
                      value={contentData.description}
                      onChange={handleContentChange}
                      required
                    />
                  </label>
                  <label>
                    Link:
                    <input
                      type="url"
                      name="link"
                      value={contentData.link}
                      onChange={handleContentChange}
                    />
                  </label>
                </>
              )}
              {modalType === 'editContent' && (
                <>
                  <label>
                    Title:
                    <input
                      type="text"
                      name="title"
                      value={contentData.title}
                      onChange={handleContentChange}
                      required
                    />
                  </label>
                  <label>
                    Description:
                    <textarea
                      name="description"
                      value={contentData.description}
                      onChange={handleContentChange}
                      required
                    />
                  </label>
                  <label>
                    Link:
                    <input
                      type="url"
                      name="link"
                      value={contentData.link}
                      onChange={handleContentChange}
                    />
                  </label>
                </>
              )}
              <div className="modal-buttons">
                <button type="submit">
                  {modalType === 'createProfile' ? "Create Profile" : modalType === 'editContent' ? "Save Changes" : `Create ${contentType}`}
                </button>
                <button type="button" onClick={handleCloseModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffDashboard;
