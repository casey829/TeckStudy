import React, { useState, useEffect } from 'react';
import { FaUser, FaPlus, FaCommentAlt, FaHeart, FaRegHeart } from 'react-icons/fa';
import { MdPostAdd, MdOutlineBookmark } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';

const API_URL = 'http://localhost:3000'; // Base URL for API

const StudentDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); 
  const [profileData, setProfileData] = useState({ name: "", email: "" });
  const [newPost, setNewPost] = useState({ title: "", description: "", link: "", thumbnail: "" });
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    fetchPosts();
    fetchWishlist();
    fetchInterests();
  }, []);

  const handleRequest = async (url, method, body = null) => {
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : null
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get response text to debug
        console.error(`Error with ${method} request to ${url}: ${response.status} ${response.statusText}, Response: ${errorText}`);
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      // Try to parse response as JSON
      try {
        return await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError);
        throw new Error('Invalid JSON response');
      }
    } catch (error) {
      console.error(`Request failed:`, error);
      throw error;
    }
  };

  const fetchPosts = async () => {
    try {
      const data = await handleRequest(`${API_URL}/content`, 'GET');
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await handleRequest(`${API_URL}/wishlists`, 'GET');
      setWishlist(data);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  const fetchInterests = async () => {
    try {
      const interests = await handleRequest(`${API_URL}/categories`, 'GET');
      setInterests(interests);
    } catch (error) {
      console.error('Failed to fetch interests:', error);
    }
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (newPost.title && newPost.description && newPost.link && newPost.thumbnail) {
      try {
        const data = await handleRequest(`${API_URL}/content`, 'POST', newPost);
        setPosts(prevPosts => [...prevPosts, data]);
        localStorage.setItem('posts', JSON.stringify([...posts, data]));
        setNewPost({ title: "", description: "", link: "", thumbnail: "" });
        handleCloseModal();
      } catch (error) {
        console.error('Failed to add post:', error);
      }
    }
  };

  const handleAddInterest = async () => {
    if (newInterest && !interests.includes(newInterest)) {
      try {
        const newInterestData = { name: newInterest };
        await handleRequest(`${API_URL}/categories`, 'POST', newInterestData);
        setNewInterest('');
        fetchInterests();
      } catch (error) {
        console.error("Failed to add interest:", error);
      }
    }
  };

  const handleAddToWishlist = async (post) => {
    try {
      if (isPostInWishlist(post.id)) {
        // Remove from wishlist
        await handleRequest(`$http://localhost:3000/wishlists/${post.id}`, 'DELETE');
        const updatedWishlist = wishlist.filter(item => item.contentId !== post.id);
        setWishlist(updatedWishlist);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      } else {
        // Add to wishlist
        const response = await handleRequest('http://localhost:3000/wishlists', 'POST', { contentId: post.id });
        if (response.message) {
          console.log('Added to wishlist:', response.message);
          const updatedWishlist = [...wishlist, { contentId: post.id }];
          setWishlist(updatedWishlist);
          localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        }
      }
    } catch (error) {
      console.error('Failed to add/remove wishlist:', error);
    }
  };
  

  const handleCommentChange = (postId, content) => {
    setComments(prevComments => ({
      ...prevComments,
      [postId]: content
    }));
  };

  const handleAddComment = async (postId) => {
    const newComment = { content: comments[postId] };
    try {
      await handleRequest(`${API_URL}/content/${postId}/comments`, 'POST', newComment);
      fetchPosts();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await handleRequest(`${API_URL}/content/${postId}/comments/${commentId}`, 'DELETE');
      fetchPosts();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setProfileData({ name: "", email: "" });
    setNewPost({ title: "", description: "", link: "", thumbnail: "" });
    setNewInterest('');
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await handleRequest('http://localhost:3000/profiles', 'PATCH', profileData);
      handleCloseModal();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleClearWishlist = async () => {
    try {
      await handleRequest('http://localhost:3000/wishlists', 'DELETE');
      setWishlist([]);
      localStorage.removeItem('wishlist');
      console.log('Wishlist cleared');
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
    }
  };

  const isPostInWishlist = (postId) => {
    return wishlist.some(item => item.contentId === postId);
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">My Dashboard</div>
        <div className="sidebar-item" onClick={() => handleOpenModal('createProfile')}>
          <FaUser className="sidebar-icon" />
          <span className="sidebar-text">Profile</span>
        </div>
        <div className="sidebar-item" onClick={() => handleOpenModal('addPost')}>
          <MdPostAdd className="sidebar-icon" />
          <span className="sidebar-text">Add Post</span>
        </div>
        <div className="sidebar-item" onClick={() => handleOpenModal('addInterest')}>
          <FaPlus className="sidebar-icon" />
          <span className="sidebar-text">Add Interest</span>
        </div>
        <div className="sidebar-item" onClick={() => handleOpenModal('viewWishlist')}>
          <MdOutlineBookmark className="sidebar-icon" />
          <span className="sidebar-text">Wishlist</span>
        </div>
      </aside>

      <main className="main-content">
        <section className="posts-section">
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-description">{post.description}</p>
              {post.thumbnail && <img src={post.thumbnail} alt={post.title} className="post-thumbnail" />}
              <button
                onClick={() => handleAddToWishlist(post)}
                className={`wishlist-button ${isPostInWishlist(post.id) ? 'in-wishlist' : ''}`}
              >
                {isPostInWishlist(post.id) ? <FaHeart /> : <FaRegHeart />}
              </button>
              <div className="comments-section">
                <input
                  type="text"
                  value={comments[post.id] || ''}
                  onChange={(e) => handleCommentChange(post.id, e.target.value)}
                  placeholder="Add a comment..."
                  className="comment-input"
                />
                <button onClick={() => handleAddComment(post.id)} className="comment-button">Comment</button>
              </div>
            </div>
          ))}
        </section>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{modalType === 'createProfile' ? 'Create Profile' : modalType === 'addPost' ? 'Add Post' : modalType === 'addInterest' ? 'Add Interest' : 'Wishlist'}</h2>
            {modalType === 'createProfile' && (
              <form onSubmit={handleProfileUpdate} className="modal-form">
                <label>
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                    className="modal-input"
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                    className="modal-input"
                  />
                </label>
                <button type="submit" className="modal-submit-button">Update Profile</button>
              </form>
            )}
            {modalType === 'addPost' && (
              <form onSubmit={handleAddPost} className="modal-form">
                <label>
                  Title:
                  <input
                    type="text"
                    name="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost(prevPost => ({ ...prevPost, title: e.target.value }))}
                    required
                    className="modal-input"
                  />
                </label>
                <label>
                  Description:
                  <textarea
                    name="description"
                    value={newPost.description}
                    onChange={(e) => setNewPost(prevPost => ({ ...prevPost, description: e.target.value }))}
                    required
                    className="modal-textarea"
                  />
                </label>
                <label>
                  Link:
                  <input
                    type="url"
                    name="link"
                    value={newPost.link}
                    onChange={(e) => setNewPost(prevPost => ({ ...prevPost, link: e.target.value }))}
                    required
                    className="modal-input"
                  />
                </label>
                <label>
                  Thumbnail URL:
                  <input
                    type="url"
                    name="thumbnail"
                    value={newPost.thumbnail}
                    onChange={(e) => setNewPost(prevPost => ({ ...prevPost, thumbnail: e.target.value }))}
                    required
                    className="modal-input"
                  />
                </label>
                <button type="submit" className="modal-submit-button">Post</button>
              </form>
            )}
            {modalType === 'addInterest' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddInterest();
              }} className="modal-form">
                <input
                  type="text"
                  placeholder="New Interest"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  required
                  className="modal-input"
                />
                <button type="submit" className="modal-submit-button">Add Interest</button>
              </form>
            )}
            {modalType === 'viewWishlist' && (
              <div className="wishlist-view">
                <button onClick={handleClearWishlist} className="clear-wishlist-button">
                  Clear Wishlist
                </button>
                <ul className="wishlist-list">
                  {wishlist.map((item, index) => (
                    <li key={index} className="wishlist-item">
                      {/* Display post content or details here if needed */}
                      {posts.find(post => post.id === item.contentId)?.title || 'Post removed'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={handleCloseModal} className="modal-close">
              <IoMdClose />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
