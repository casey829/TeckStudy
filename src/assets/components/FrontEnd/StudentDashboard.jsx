import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentDashboard.css'; // Import the CSS file for custom styles

const API_URL = 'http://localhost:5000'; // Update with your backend URL

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
    profile_picture_url: ''
  });
  const [categories, setCategories] = useState([]);
  const [comments, setComments] = useState({});
  const [isModalOpen, setIsModalOpen] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
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
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/students/content`);
      setPosts(response.data);
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
    try {
      const response = await axios.get(`${API_URL}/students/profile`);
      setProfileData(response.data);
      setUserId(response.data.id);
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/students/profile`, profileData);
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

  const handleAddToWishlist = async (postId) => {
    try {
      if (wishlist.find(item => item.content_id === postId)) {
        await axios.delete(`${API_URL}/students/wishlist/${postId}`);
        setWishlist(wishlist.filter(item => item.content_id !== postId));
      } else {
        if (!userId) {
          console.error('User ID is required to add to wishlist.');
          return;
        }
        await axios.post(`${API_URL}/students/wishlist`, { user_id: userId, content_id: postId });
        setWishlist([...wishlist, { content_id: postId }]);
      }
    } catch (error) {
      console.error('Failed to add/remove wishlist:', error);
    }
  };

  const handleAddComment = async (postId) => {
    try {
      if (!userId) {
        console.error('User ID is required to add a comment.');
        return;
      }
      await axios.post(`${API_URL}/students/comments`, { content_id: postId, user_id: userId, text: comments[postId] });
      fetchPosts();
      setComments({ ...comments, [postId]: '' });
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar-left">
        <div className="profile-summary">
          <img src={profileData.profile_picture_url || 'default-avatar.jpg'} alt="Profile" />
          <h3>{profileData.username}</h3>
          <button className="button-primary" onClick={() => setIsModalOpen('profile')}>Edit Profile</button>
          <button className="button-primary" onClick={() => setIsModalOpen('post')}>Add Post</button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><button onClick={() => setIsModalOpen('profile')}>Edit Profile</button></li>
            <li><button onClick={() => setIsModalOpen('post')}>Add Post</button></li>
            <li><button onClick={() => fetchWishlist()}>Refresh Wishlist</button></li>
          </ul>
          
        </nav>
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

        {/* Profile Section */}
        {isModalOpen === 'profile' && (
          <div className="modal">
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
          </div>
        )}

        {/* Post Section */}
        {isModalOpen === 'post' && (
          <div className="modal">
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
          </div>
        )}

        {/* Posts List */}
        <section className="posts-list">
          <h2>Posts</h2>
          {posts.map(post => (
            <div key={post.id} className="post">
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <a href={post.content_url} target="_blank" rel="noopener noreferrer">View Content</a>
              <button 
                className={`button-primary ${wishlist.find(item => item.content_id === post.id) ? 'in-wishlist' : ''}`}
                onClick={() => handleAddToWishlist(post.id)}
              >
                {wishlist.find(item => item.content_id === post.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
              <div className="comments-section">
                <h4>Comments</h4>
                <input 
                  type="text" 
                  value={comments[post.id] || ''} 
                  onChange={e => setComments({ ...comments, [post.id]: e.target.value })}
                  placeholder="Add a comment"
                />
                <button 
                  className="button-primary"
                  onClick={() => handleAddComment(post.id)}
                >
                  Add Comment
                </button>
                <ul>
                  {/* Display Comments */}
                </ul>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
