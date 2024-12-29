import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageCircle, Search, Home, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FriendsDropdown } from './FriendsDropdown';

export const Navbar = ({ onSearch, darkMode, setDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const email = localStorage.getItem('token');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUserSuggestions = async () => {
      if (searchTerm.trim().length === 0) {
        setUserSuggestions([]);
        return;
      }

      setIsLoading(true);
      
      try {
        const response = await fetch(`http://localhost:3000/api/searchuser/${encodeURIComponent(searchTerm)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const suggestions = data.recommendations || [];
        setUserSuggestions(suggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching user suggestions:', error);
        setUserSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchUserSuggestions();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    if (email) {
      // Fetch received friend requests
      fetch(`http://localhost:3000/api/friends/requests/received/${email}`)
        .then(response => response.json())
        .then(data => {
          console.log('Received friend requests:', data);
          setReceivedRequests(data.requests);
        });
    }
  }, [email]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.username);
    onSearch(suggestion.username);
    setShowSuggestions(false);
    // Navigate to user profile page
    navigate(`/user/${encodeURIComponent(suggestion.email)}`);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleAcceptRequest = (senderEmail, timestamp) => {
    const requestPayload = {
      senderEmail,
      receiverEmail: email,
      timestamp
    };

    fetch('http://localhost:3000/api/friends/request/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    })
      .then((response) => {
        console.log('Accept friend request response:', response); // Debugging
        if (!response.ok) {
          throw new Error(`Error accepting friend request: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Accept friend request success:', data); // Debugging
        alert(data.message || 'Friend request accepted!');
        setReceivedRequests((prev) =>
          prev.filter((req) => req.sender.email !== senderEmail || req.timestamp !== timestamp)
        ); // Remove accepted request from the list
      })
      .catch((error) => {
        console.error('Error accepting friend request:', error); // Debugging
        alert('Failed to accept friend request.');
      });
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md fixed top-0 left-0 right-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 
              onClick={handleHomeClick}
              className="text-xl font-bold text-blue-500 cursor-pointer hover:text-blue-600 transition-colors"
            >
              SocialConnect
            </h1>
            <div className="ml-6 relative hidden md:block" ref={searchRef}>
              <input
                type="text"
                value={searchTerm}
                placeholder="Search users..."
                className={`${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                } rounded-full px-4 py-2 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              
              {showSuggestions && !isLoading && userSuggestions.length > 0 && (
                <div className={`absolute mt-2 w-full rounded-md shadow-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-white'
                }`}>
                  <ul className="py-1">
                    {userSuggestions.map((user, index) => (
                      <li
                        key={user.email + index}
                        className={`px-4 py-2 cursor-pointer flex items-center gap-3 ${
                          darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleSuggestionClick(user)}
                      >
                        <img
                          src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${user.email}&radius=50`}
                          alt={user.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex flex-col">
                          <span className={`${darkMode ? 'text-white' : 'text-gray-800'} font-medium`}>
                            {user.username}
                          </span>
                          <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                            {user.email}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showSuggestions && !isLoading && searchTerm && userSuggestions.length === 0 && (
                <div className={`absolute mt-2 w-full rounded-md shadow-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-white'
                } p-4 text-center`}>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    No users found
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <button 
              onClick={handleHomeClick}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Home className={`h-6 w-6 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowRequests(!showRequests)}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <Bell className={`h-6 w-6 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`} />
              </button>
              {showRequests && (
                <div className={`absolute right-0 mt-2 w-80 rounded-md shadow-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-white'
                }`}>
                  <ul className="py-1">
                    {receivedRequests.length > 0 ? (
                      receivedRequests.map((request, index) => (
                        <li
                          key={request.sender.email + index}
                          className={`px-4 py-2 cursor-pointer flex items-center gap-3 ${
                            darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                          }`}
                        >
                          <img
                            src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${request.sender.email}&radius=50`}
                            alt={request.sender.username}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex flex-col flex-1">
                            <span className={`${darkMode ? 'text-white' : 'text-gray-800'} font-medium`}>
                              {request.sender.username}
                            </span>
                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                              {request.sender.email}
                            </span>
                          </div>
                          <button 
                            className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm hover:bg-blue-600 transition-colors"
                            onClick={() => handleAcceptRequest(request.sender.email, request.timestamp)}
                          >
                            Accept
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-center">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          No friend requests
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <button className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <FriendsDropdown darkMode={darkMode}/>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {darkMode ? (
                <Sun className="h-6 w-6 text-gray-200" />
              ) : (
                <Moon className="h-6 w-6 text-gray-600" />
              )}
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
              <img
                src={`https://api.dicebear.com/6.x/avataaars/svg?seed=2994200&radius=50`}
                alt="User avatar"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};