import React, { useEffect, useState } from 'react';
import { Users, ChevronDown, Search } from 'lucide-react';

export const FriendsDropdown = ({ darkMode }) => {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const email = localStorage.getItem('token');

  useEffect(() => {
    if (email) {
      setIsLoading(true);
      fetch(`http://localhost:3000/getFriends/${email}`)
        .then(response => response.json())
        .then(data => {
          // Remove duplicates and add consistent avatars
          const uniqueFriends = Array.from(
            new Map(data.friends.map(friend => [
              friend.email,
              {
                ...friend,
                profilePicture: friend.profilePicture || 
                  `https://api.dicebear.com/6.x/avataaars/svg?seed=${friend.email}&radius=50`
              }
            ])).values()
          );
          setFriends(uniqueFriends);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching friends:', error);
          setIsLoading(false);
        });
    }
  }, [email]);

  const filteredFriends = friends.filter(friend => 
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-colors flex items-center space-x-1
          ${darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
      >
        <Users className="h-6 w-6" />
        {friends.length > 0 && (
          <span className="bg-blue-500 text-white text-xs font-medium rounded-full px-2 py-0.5">
            {friends.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 rounded-md shadow-lg
          ${darkMode ? 'bg-gray-700 ring-1 ring-black ring-opacity-5' : 'bg-white'}`}>
          <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Friends</h3>
            <div className={`mt-2 flex items-center px-3 py-2 rounded-md
              ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`ml-2 bg-transparent w-full outline-none text-sm
                  ${darkMode 
                    ? 'text-white placeholder-gray-400' 
                    : 'text-gray-700 placeholder-gray-500'}`}
              />
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading friends...</p>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="p-4 text-center">
                <Users className={`h-12 w-12 mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {searchQuery ? 'No friends found' : 'No friends yet'}
                </p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchQuery ? 'Try a different search term' : 'Start connecting with people!'}
                </p>
              </div>
            ) : (
              <div>
                {filteredFriends.map(friend => (
                  <div
                    key={friend.email}
                    className={`px-4 py-3 flex items-center gap-3
                      ${darkMode 
                        ? 'hover:bg-gray-600 border-gray-600' 
                        : 'hover:bg-gray-50 border-gray-100'} 
                      border-b cursor-pointer`}
                  >
                    <img
                      src={friend.profilePicture}
                      alt={friend.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium truncate
                        ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {friend.username}
                      </p>
                      <p className={`text-sm truncate
                        ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {friend.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsDropdown;