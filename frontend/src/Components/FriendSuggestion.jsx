import React, { useEffect, useState } from 'react';
import { Users, X, Check } from 'lucide-react';

export const FriendSuggestions = ({ darkMode }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [sentRequests, setSentRequests] = useState(new Set());
  const email = localStorage.getItem('token');

  useEffect(() => {
    if (email) {
      // Fetch available users for friend requests
      fetch(`http://localhost:3000/api/friends/available/${email}`)
        .then(response => response.json())
        .then(data => {
          console.log('Available users:', data.users);
          setSuggestions(data.users);
        });

      // Fetch received friend requests
      fetch(`http://localhost:3000/api/friends/requests/received/${email}`)
        .then(response => response.json())
        .then(data => {
          console.log('Received friend requests:', data.requests);
        });
    }
  }, [email]);

  const handleSendRequest = (receiverEmail) => {
    const requestPayload = {
      senderEmail: email,
      receiverEmail: receiverEmail,
      timestamp: new Date().toISOString()
    };

    fetch('http://localhost:3000/api/friends/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Friend request response:', data);
      if (data.message === 'Friend request created') {
        setSentRequests(prev => new Set([...prev, receiverEmail]));
      } else {
        alert('Failed to send friend request.');
      }
    });
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">People You May Know</h2>
        </div>
        <button className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-500'} hover:underline`}>
          See All
        </button>
      </div>
      
      <div className="space-y-4">
        {suggestions.map(person => (
          <div 
            key={person.email} 
            className={`${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            } p-3 rounded-lg transition-colors`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={"https://toppng.com/uploads/preview/friend-request-icon-friend-request-icon-vector-11553469752bhdya9ldko.png"}
                    alt={person.username} 
                    className="w-12 h-12 rounded-full border-2 border-blue-500"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="font-medium hover:underline cursor-pointer">{person.username}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Age: {person.age}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center mt-1`}>
                    <Users className="h-3 w-3 mr-1" />
                    {person.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              {sentRequests.has(person.email) ? (
                <button 
                  className="flex-1 bg-green-500 text-white px-4 py-1.5 rounded-full text-sm flex items-center justify-center space-x-1 cursor-default"
                  disabled
                >
                  <Check className="h-4 w-4" />
                  <span>Request Sent</span>
                </button>
              ) : (
                <button 
                  className="flex-1 bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-blue-600 transition-colors"
                  onClick={() => handleSendRequest(person.email)}
                >
                  Connect
                </button>
              )}
              <button className={`p-1.5 ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} rounded-full`}>
                <X className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendSuggestions;