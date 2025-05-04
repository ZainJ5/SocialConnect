import React, { useState, useEffect } from 'react';
import { Navbar } from '../Components/Navbar';
import CreatePost from '../Components/CreatePost';
import Post from '../Components/Post';
import { FriendSuggestions } from '../Components/FriendSuggestion';
import AIChatbot from '../Components/AIChatbot';
import Trending from '../Components/Trending';

const MainPage = () => {
  const [posts, setPosts] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const currentUser = localStorage.getItem("token"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3000/api/allposts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const posts = await response.json();
  
const postsWithUserInfo = await Promise.all(
  posts.map(async (post) => {
    console.log("User_id: " + post.user_id);

    const userData = await fetchUserInfo(post.user_id);
    console.log("User data: " + JSON.stringify(userData));

    const randomString = Math.random().toString(36).substring(2, 15); // Random string
    const userAvatarSeed = `${userData?.name || post.user_id || "default"}-${randomString}`;
    const userAvatarUrl = `https://api.dicebear.com/6.x/avataaars/svg?seed=${encodeURIComponent(userAvatarSeed)}&radius=50`;

    const obj = {
      ...post,
      user_id: userData || null,
      avatar: userAvatarUrl, 
    };
    console.log("Object is:" + JSON.stringify(obj));

    return {
      ...obj,
      userName: userData?.name || "Anonymous",
    };
  })
);


  
      setPosts(postsWithUserInfo);
      setError(null);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchUserInfo = async (email) => {
    console.log("Email: " + email)
    try {
      if (!email) {
        console.warn('No email provided for user info fetch');
        return null;
      }
  
      const response = await fetch(`http://localhost:3000/api/user/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const userData = await response.json();
      console.log("UserData API: " + JSON.stringify(userData))
      return userData.name;
      
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  };

  const handleNewPost = async (postData) => {
    try {
      const formData = new FormData();
      formData.append('content', postData.content);
      if (postData.media) {
        formData.append('media', postData.media);
      }
      formData.append('user_id', currentUser);

      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to create post');

      const newPost = await response.json();
      setPosts([newPost, ...posts]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      const response = await fetch(`http://localhost:3000/api/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: comment, userId: currentUser, postId: postId, commentAt: new Date().toISOString() })
      });

      if (!response.ok) throw new Error('Failed to add comment');

      setPosts(posts.map(post =>
        post.uniqueId === postId
          ? { ...post, comments: post.comments + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleshare = async (postId) => {
    try {
      await fetch(`http://localhost:3000/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser, postId: postId })
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const filteredPosts = searchQuery
    ? posts.filter(post =>
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <Navbar 
        onSearch={setSearchQuery} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        currentUser={currentUser}
      />

      <div className="max-w-7xl mx-auto px-4 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Trending darkMode={darkMode} />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <CreatePost 
              onPost={handleNewPost} 
              darkMode={darkMode}
            />

            {isLoading ? (
              <div className={`text-center p-6 rounded-lg ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow`}>
                <p>Loading posts...</p>
              </div>
            ) : error ? (
              <div className="text-center p-6 bg-red-50 text-red-500 rounded-lg">
                {error}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className={`text-center p-6 rounded-lg ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow`}>
                <p>No posts found</p>
              </div>
            ) : (
              filteredPosts.map(post => (
                <Post
                  key={post.uniqueId}
                  post={post}
                  onComment={handleComment}
                  onShare={handleshare}
                  darkMode={darkMode}
                  currentUser={currentUser}
                />
              ))
            )}
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24">
              <FriendSuggestions darkMode={darkMode} />
            </div>
          </div>
        </div>
      </div>

      <AIChatbot 
        darkMode={darkMode} 
        apiKey={"YOUR GEMINI API KEY"}
      />
    </div>
  );
};

export default MainPage;
