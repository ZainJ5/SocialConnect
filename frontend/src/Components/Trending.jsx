import React, { useState, useEffect } from 'react';
import { TrendingUp, Heart, MessageCircle, Share2 } from 'lucide-react';

const TrendingPost = ({ darkMode }) => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState({});

  const fetchUserInfo = async (email) => {
    try {
      const response = await fetch(`http://localhost:3000/api/user/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/posts/trending/3');
        if (!response.ok) {
          throw new Error('Failed to fetch trending posts');
        }
        const data = await response.json();
        setTrendingPosts(data);

        // Fetch user info for each post
        const userInfoPromises = data.map(post => fetchUserInfo(post.user_id));
        const userInfoResults = await Promise.all(userInfoPromises);
        
        // Create a map of user_id to user info
        const userInfoMap = {};
        data.forEach((post, index) => {
          if (userInfoResults[index]) {
            userInfoMap[post.user_id] = userInfoResults[index];
          }
        });
        
        setUserInfo(userInfoMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingPosts();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours === 1) return '1h';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  if (isLoading) {
    return (
      <div className={`rounded-lg shadow-md p-8 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading trending posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg shadow-md p-8 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Trending Now</h2>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {trendingPosts.map((post) => {
          const user = userInfo[post.user_id] || {};
          return (
            <div
              key={post.uniqueId}
              className={`p-4 transition-colors hover:bg-opacity-50 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
              <img
  src={'data:image/png;base64,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'}
  alt="User avatar"
  className="w-8 h-8 rounded-full object-cover"
/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium truncate">
                      {user.name || `User ${post.user_id}`}
                    </p>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      · {formatTimeAgo(post.timestamp)}
                    </span>
                  </div>
                  {user.bio && (
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      {user.bio}
                    </p>
                  )}
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                    {post.content}
                  </p>
                  {post.media_urls && post.media_type === 'image' && (
                    <img
                      src={post.media_urls}
                      alt={post.content}
                      className="mt-2 rounded-lg max-h-64 w-auto"
                    />
                  )}
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center space-x-1 text-sm">
                      <Heart className="h-4 w-4 text-gray-400" />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {formatNumber(post.likes)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <MessageCircle className="h-4 w-4 text-gray-400" />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {formatNumber(post.comments)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <Share2 className="h-4 w-4 text-gray-400" />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {formatNumber(post.shares)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
          Show more trending posts
        </button>
      </div>
    </div>
  );
};

export default TrendingPost;