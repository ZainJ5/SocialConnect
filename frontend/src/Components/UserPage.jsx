import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from './Navbar';
import AIChatbot from './AIChatbot';
import { Mail, Calendar, Loader2, User, MapPin, Quote } from 'lucide-react';

const UserPage = ({ apiKey }) => {
  const { email } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Random inspirational quotes
  const quotes = [
    { text: "Life is what happens while you're busy making other plans.", author: "John Lennon" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" }
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching data for email:', email);
        const response = await fetch(`http://localhost:3000/api/user/${email}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data);
        setUser(data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [email]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} onSearch={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} onSearch={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md mx-4 w-full">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <User className="h-8 w-8 text-red-600 dark:text-red-300" />
              </div>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                Error Loading Profile
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} onSearch={() => {}} />

      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="flex justify-center mt-8">
              {user?.email && (
                <div className="rounded-full p-1 bg-white dark:bg-gray-800 shadow-xl">
                  <img
                    src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${encodeURIComponent(
                      user.email
                    )}&radius=50`}
                    alt={user?.username || 'User Avatar'}
                    className="w-32 h-32 rounded-full ring-4 ring-white dark:ring-gray-800"
                  />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center mt-6">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {user?.name || 'Unknown User'}
              </h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-8">
              <div className="space-y-4">
                {user?.email && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-300">{user.email}</span>
                  </div>
                )}
                
                {user?.age && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {user.age} years old
                    </span>
                  </div>
                )}
                
                {user?.location && (
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-300">{user.location}</span>
                  </div>
                )}
              </div>
              
              {/* Quote Section */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <Quote className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 italic">
                      "{randomQuote.text}"
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      — {randomQuote.author}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AIChatbot darkMode={darkMode} apiKey={apiKey} />
    </div>
  );
};

export default UserPage;