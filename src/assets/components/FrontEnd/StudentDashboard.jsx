import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentDashboard.css'; // Import custom styles
import Modal from 'react-modal';
import { FaHeart, FaRegHeart, FaRegCommentDots } from 'react-icons/fa';

const API_URL = 'https://motivation-ptatform-1.onrender.com'; // Update with your backend URL
const defaultProfilePictureUrl = 'https://s.abcnews.com/images/Technology/AP_Sundar_Pichai_ml_150811_16x9_1600.jpg';

Modal.setAppElement('#root');

const StudentDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    content_url: '',
    content_type: '',
    category_id: '',
  });
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    password_hash: '',
    bio: '',
    profile_picture_url: defaultProfilePictureUrl,
  });
  const [categories, setCategories] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [comments, setComments] = useState({});
  const [isModalOpen, setIsModalOpen] = useState('');
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    setUserId(storedUserId);
    if (storedUserId) {
      fetchPosts();
      fetchWishlist();
      fetchProfile();
      fetchCategories();
      fetchUserCategories();
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/students/content`);
      // Filter posts where flagged is false
      const filteredPosts = response.data.filter(post => !post.flagged);
      setPosts(filteredPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`${API_URL}/students/wishlist`);
      setWishlist(response.data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  const fetchProfile = async () => {
    const userId = localStorage.getItem('user_id');
  
    if (!userId) {
      console.error('User ID not found in local storage.');
      return;
    }
  
    const url = `${API_URL}/students/profile/${userId}`;
  
    try {
      const response = await axios.get(url);
      setProfileData(response.data);
      setUserId(userId); // Set userId from local storage
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/students/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchUserCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/students/categories`);
      setUserCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch user categories:', error);
    }
  };

  const fetchComments = async (contentId) => {
    try {
      const response = await axios.get(`${API_URL}/students/comments/${contentId}`);
      setComments(prev => ({ ...prev, [contentId]: response.data }));
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
  
    const userId = localStorage.getItem('user_id');
  
    if (!userId) {
      console.error('User ID not found in local storage.');
      return;
    }
  
    const url = `${API_URL}/students/profile/${userId}`;
  
    try {
      await axios.patch(url, profileData);
      fetchProfile();
      setIsModalOpen('');
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!userId) {
      console.error('User ID is required.');
      return;
    }
    try {
      if (!newPost.title || !newPost.content_url || !newPost.content_type) {
        console.error('Title, content URL, and content type are required.');
        return;
      }
      const response = await axios.post(`${API_URL}/students/content`, {
        ...newPost,
        user_id: userId,
      });
      setPosts([...posts, response.data]);
      setNewPost({
        title: '',
        description: '',
        content_url: '',
        content_type: '',
        category_id: '',
      });
      setIsModalOpen('');
      setSuccessMessage('Post added successfully!');
    } catch (error) {
      console.error('Failed to add post:', error);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
  
    const userId = localStorage.getItem('user_id');
  
    if (!userId) {
      console.error('User ID not found in local storage.');
      return;
    }
  
    const url = `${API_URL}/students/profile`;
  
    try {
      await axios.post(url, { ...profileData, user_id: userId });
      fetchProfile();
      setIsModalOpen('');
      setSuccessMessage('Profile created successfully!');
    } catch (error) {
      console.error('Failed to create profile:', error);
    }
  };

  const handleAddToWishlist = async (contentId) => {
    try {
      if (wishlist.find(item => item.content_id === contentId)) {
        await axios.delete(`${API_URL}/students/wishlist/${contentId}`);
        setWishlist(wishlist.filter(item => item.content_id !== contentId));
        setSuccessMessage('Removed from wishlist!');
      } else {
        if (!userId) {
          console.error('User ID is required to add to wishlist.');
          return;
        }
        await axios.post(`${API_URL}/students/wishlist`, { user_id: userId, content_id: contentId });
        setWishlist([...wishlist, { content_id: contentId }]);
        setSuccessMessage('Added to wishlist!');
      }
    } catch (error) {
      console.error('Failed to add/remove wishlist:', error);
    }
  };

  const handleAddComment = async (contentId) => {
    try {
      if (!userId) {
        console.error('User ID is required to add a comment.');
        return;
      }
      await axios.post(`${API_URL}/students/comments`, { content_id: contentId, user_id: userId, text: comments[contentId] });
      fetchComments(contentId); // Refetch comments after adding
      setComments({ ...comments, [contentId]: '' });
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const openCommentsModal = (contentId) => {
    setSelectedContentId(contentId);
    fetchComments(contentId);
    setIsModalOpen('comments');
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar-left">
        <div className="profile-summary">
          <img 
            src={profileData.profile_picture_url || 'default-avatar.jpg'} 
            alt="Profile" 
            className="profile-pic" 
          />
          <h3>{profileData.username}</h3>
          
          <button className="button-primary" onClick={() => setIsModalOpen('profile')}>Edit Profile</button>
          <button className="button-primary" onClick={() => setIsModalOpen('post')}>New Post</button>
        </div>
        <div className="subscribed-categories">
          <h3>Subscribed Categories</h3>
          <ul>
            {userCategories.map(cat => (
              <li key={cat.id}>{cat.name}</li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1>Student Dashboard</h1>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {/* Profile Modal */}
        <Modal
          isOpen={isModalOpen === 'profile'}
          onRequestClose={() => setIsModalOpen('')}
          contentLabel="Edit Profile"
          className="modal"
          overlayClassName="modal-overlay"
        >
          <div className="modal-content">
            <button className="close-btn" onClick={() => setIsModalOpen('')}>×</button>
            <h2>Edit Profile</h2>
            <form onSubmit={handleProfileUpdate}>
              <label>
                Username:
                <input 
                  type="text" 
                  value={profileData.username} 
                  onChange={e => setProfileData({ ...profileData, username: e.target.value })}
                />
              </label>
              <label>
                Email:
                <input 
                  type="email" 
                  value={profileData.email} 
                  onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                />
              </label>
              <label>
                Password:
                <input 
                  type="password" 
                  value={profileData.password_hash} 
                  onChange={e => setProfileData({ ...profileData, password_hash: e.target.value })}
                />
              </label>
              <label>
                Bio:
                <textarea 
                  value={profileData.bio} 
                  onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                />
              </label>
              <label>
                Profile Picture URL:
                <input 
                  type="text" 
                  value={profileData.profile_picture_url} 
                  onChange={e => setProfileData({ ...profileData, profile_picture_url: e.target.value })}
                />
              </label>
              <button type="submit" className="button-primary">Save</button>
            </form>
          </div>
        </Modal>

        {/* Add Post Modal */}
        <Modal
          isOpen={isModalOpen === 'post'}
          onRequestClose={() => setIsModalOpen('')}
          contentLabel="Add Post"
          className="modal"
          overlayClassName="modal-overlay"
        >
          <div className="modal-content">
            <button className="close-btn" onClick={() => setIsModalOpen('')}>×</button>
            <h2>Add New Post</h2>
            <form onSubmit={handleAddPost}>
              <label>
                Title:
                <input 
                  type="text" 
                  value={newPost.title} 
                  onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                  required
                />
              </label>
              <label>
                Description:
                <textarea 
                  value={newPost.description} 
                  onChange={e => setNewPost({ ...newPost, description: e.target.value })}
                />
              </label>
              <label>
                Content URL:
                <input 
                  type="text" 
                  value={newPost.content_url} 
                  onChange={e => setNewPost({ ...newPost, content_url: e.target.value })}
                  required
                />
              </label>
              <label>
                Content Type:
                <select 
                  value={newPost.content_type} 
                  onChange={e => setNewPost({ ...newPost, content_type: e.target.value })}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="image">Image</option>
                </select>
              </label>
              <label>
                Category:
                <select 
                  value={newPost.category_id} 
                  onChange={e => setNewPost({ ...newPost, category_id: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="button-primary">Add Post</button>
            </form>
          </div>
        </Modal>

        {/* Comments Modal */}
        <Modal
          isOpen={isModalOpen === 'comments'}
          onRequestClose={() => setIsModalOpen('')}
          contentLabel="Post Details and Comments"
          className="modal"
          overlayClassName="modal-overlay"
        >
          <div className="modal-content">
            <button className="close-btn" onClick={() => setIsModalOpen('')}>×</button>
            <h2>Post Details and Comments</h2>
            {posts.find(post => post.id === selectedContentId) && (
              <div>
                <h3>{posts.find(post => post.id === selectedContentId).title}</h3>
                <p>{posts.find(post => post.id === selectedContentId).description}</p>
                <a href={posts.find(post => post.id === selectedContentId).content_url} target="_blank" rel="noopener noreferrer">View Content</a>
                <div className="comments-section">
                  <input 
                    type="text" 
                    value={comments[selectedContentId]?.text || ''} 
                    onChange={e => setComments({ ...comments, [selectedContentId]: { text: e.target.value } })}
                    placeholder="Add a comment"
                  />
                  <button 
                    className="button-primary"
                    onClick={() => handleAddComment(selectedContentId)}
                  >
                    Add Comment
                  </button>
                  <ul>
                    {/* Display Comments */}
                    {comments[selectedContentId]?.map(comment => (
                      <li key={comment.id}>{comment.text}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Posts List */}
        <section className="posts-list">
          <h2>Posts</h2>
          <div className="posts-grid">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-content">
                  <h3 className="post-title">
                    {post.title}
                    <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
                  </h3>
                  <p>{post.description}</p>
                  <a href={post.content_url} target="_blank" rel="noopener noreferrer" className="show-more">Show more</a>
                </div>
                <div className="post-actions">
                  <button 
                    className={`wishlist-btn ${wishlist.find(item => item.content_id === post.id) ? 'in-wishlist' : ''}`}
                    onClick={() => handleAddToWishlist(post.id)}
                  >
                    {wishlist.find(item => item.content_id === post.id) ? <FaHeart /> : <FaRegHeart />}
                  </button>
                  <button 
                    className="comments-btn"
                    onClick={() => openCommentsModal(post.id)}
                  >
                    <FaRegCommentDots />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
