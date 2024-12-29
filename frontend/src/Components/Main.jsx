import React, { useState } from 'react';
import { Bell, Heart, MessageCircle, Search, User, Users, Home, Trending, Send, MenuSquare } from 'lucide-react';

// Mock data
const initialPosts = [
  {
    id: 1,
    user: "Sarah Johnson",
    content: "Just launched my new portfolio website! 🚀",
    likes: 45,
    comments: 12,
    timestamp: "2h ago",
    isLiked: false
  },
  {
    id: 2,
    user: "Mike Chen",
    content: "Beautiful sunset at the beach today! 🌅",
    likes: 89,
    comments: 23,
    timestamp: "4h ago",
    isLiked: true
  }
];

const FriendSuggestions = () => {
  const suggestions = [
    { id: 1, name: "Emma Wilson", mutualFriends: 12 },
    { id: 2, name: "James Brown", mutualFriends: 8 },
    { id: 3, name: "Lisa Anderson", mutualFriends: 15 }
  ];

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-semibold mb-4">People You May Know</h2>
      {suggestions.map(person => (
        <div key={person.id} className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="ml-3">
              <p className="font-medium">{person.name}</p>
              <p className="text-sm text-gray-500">{person.mutualFriends} mutual friends</p>
            </div>
          </div>
          <button className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-600">
            Connect
          </button>
        </div>
      ))}
    </div>
  );
};

const Navbar = ({ onSearch }) => {
  return (
    <div className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-500">SocialConnect</h1>
            <div className="ml-6 relative">
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-100 rounded-full px-4 py-2 pl-10 w-64"
                onChange={(e) => onSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Home className="h-6 w-6 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Bell className="h-6 w-6 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MessageCircle className="h-6 w-6 text-gray-600" />
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreatePost = ({ onPost }) => {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (content.trim()) {
      onPost(content);
      setContent("");
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md mb-4">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <textarea
            className="w-full border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What's on your mind?"
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
          <div className="flex justify-between items-center mt-3">
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MenuSquare className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Post = ({ post, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-4">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="ml-3">
            <p className="font-medium">{post.user}</p>
            <p className="text-sm text-gray-500">{post.timestamp}</p>
          </div>
        </div>
        <p className="mb-4">{post.content}</p>
        <div className="flex items-center justify-between border-t pt-3">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center space-x-1 ${
              post.isLiked ? "text-red-500" : "text-gray-500"
            }`}
          >
            <Heart className={`h-5 w-5 ${post.isLiked ? "fill-current" : ""}`} />
            <span>{post.likes}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 text-gray-500"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.comments}</span>
          </button>
        </div>
      </div>
      {showComments && (
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              onClick={handleComment}
              className="bg-blue-500 text-white rounded-full p-2"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="fixed bottom-4 right-4">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-lg w-80 mb-4 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">AI Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="h-64 overflow-y-auto border rounded-lg p-3 mb-4">
            <div className="bg-gray-100 rounded-lg p-2 mb-2">
              Hello! How can I help you today?
            </div>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-3 py-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
              Send
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
};

const Main = () => {
  const [posts, setPosts] = useState(initialPosts);

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const handleComment = (postId, comment) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1
        };
      }
      return post;
    }));
  };

  const handlePost = (content) => {
    const newPost = {
      id: posts.length + 1,
      user: "Current User",
      content,
      likes: 0,
      comments: 0,
      timestamp: "Just now",
      isLiked: false
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar onSearch={(query) => console.log('Searching:', query)} />
      <div className="max-w-6xl mx-auto px-4 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <CreatePost onPost={handlePost} />
            {posts.map(post => (
              <Post
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))}
          </div>
          <div className="hidden md:block">
            <FriendSuggestions />
          </div>
        </div>
      </div>
      <AIChatbot />
    </div>
  );
};

export default Main;