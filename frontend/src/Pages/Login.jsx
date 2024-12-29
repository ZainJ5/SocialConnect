import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    recoveryKey: '',
    newPassword: '',
  });

  const [responseMessages, setResponseMessages] = useState({
    register: '',
    login: '',
    forgotPassword: ''
  });
  const [activeSection, setActiveSection] = useState('login');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleFetch = async (endpoint, method, body) => {
    try {
      const response = await fetch(`http://localhost:3000/api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      console.log('Response: ' + JSON.stringify(response));

      if (response.ok) {
        const data = body.email;
        console.log('Response is Good');
        console.log('Token' + data);
        console.log('Body' + JSON.stringify(body));
        
        if (endpoint === '/login' && data) {
          localStorage.setItem('token', data);
          navigate('/main');
          return;
        }

        // Set success messages based on endpoint
        switch (endpoint) {
          case '/register':
            setResponseMessages(prev => ({ ...prev, register: 'Registration successful!' }));
            break;
          case '/login':
            setResponseMessages(prev => ({ ...prev, login: 'Login successful!' }));
            break;
          case '/forgotpassword':
            setResponseMessages(prev => ({ ...prev, forgotPassword: 'Password reset successful!' }));
            break;
        }
      } else {
        // Set error messages based on endpoint
        switch (endpoint) {
          case '/register':
            setResponseMessages(prev => ({ ...prev, register: 'Registration failed. Please try again.' }));
            break;
          case '/login':
            setResponseMessages(prev => ({ ...prev, login: 'Login failed. Please check your credentials.' }));
            break;
          case '/forgotpassword':
            setResponseMessages(prev => ({ ...prev, forgotPassword: 'Password reset failed. Please verify your information.' }));
            break;
        }
      }
    } catch (error) {
      // Set error messages for network/server errors
      switch (endpoint) {
        case '/register':
          setResponseMessages(prev => ({ ...prev, register: 'Server error during registration. Please try again later.' }));
          break;
        case '/login':
          setResponseMessages(prev => ({ ...prev, login: 'Server error during login. Please try again later.' }));
          break;
        case '/forgotpassword':
          setResponseMessages(prev => ({ ...prev, forgotPassword: 'Server error during password reset. Please try again later.' }));
          break;
      }
      console.error('Error:', error);
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.age || !formData.email || !formData.password || !formData.recoveryKey) {
      setResponseMessages(prev => ({ ...prev, register: 'Please fill in all fields' }));
      return;
    }

    await handleFetch('/register', 'POST', {
      name: formData.name,
      age: parseInt(formData.age),
      email: formData.email,
      password: formData.password,
      recoveryKey: parseInt(formData.recoveryKey),
    });
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setResponseMessages(prev => ({ ...prev, login: 'Please enter email and password' }));
      return;
    }

    await handleFetch('/login', 'POST', {
      email: formData.email,
      password: formData.password,
    });
  };

  const handleForgotPassword = async () => {
    if (!formData.email || !formData.recoveryKey || !formData.newPassword) {
      setResponseMessages(prev => ({ ...prev, forgotPassword: 'Please fill in all fields' }));
      return;
    }

    await handleFetch('/forgotpassword', 'POST', {
      email: formData.email,
      recoveryKey: parseInt(formData.recoveryKey),
      newPassword: formData.newPassword,
    });
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'register':
        return (
          <div className="space-y-4">
            {['name', 'age', 'email', 'password', 'recoveryKey'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <input
                  type={field === 'age' || field === 'recoveryKey' ? 'number' : field === 'password' ? 'password' : 'text'}
                  name={field}
                  placeholder={`Enter ${field}`}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            ))}
            <button onClick={handleRegister} className="w-full bg-blue-600 text-white py-2 rounded-md">
              Register
            </button>
          </div>
        );
      case 'login':
        return (
          <div className="space-y-4">
            {['email', 'password'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === 'password' ? 'password' : 'email'}
                  name={field}
                  placeholder={`Enter ${field}`}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            ))}
            <button onClick={handleLogin} className="w-full bg-green-600 text-white py-2 rounded-md">
              Login
            </button>
          </div>
        );
      case 'forgotPassword':
        return (
          <div className="space-y-4">
            {['email', 'recoveryKey', 'newPassword'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <input
                  type={field === 'recoveryKey' ? 'number' : field === 'newPassword' ? 'password' : 'text'}
                  name={field}
                  placeholder={`Enter ${field}`}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            ))}
            <button onClick={handleForgotPassword} className="w-full bg-red-600 text-white py-2 rounded-md">
              Reset Password
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold text-center">User Authentication</h2>

        <div className="flex border-b pb-2">
          {['login', 'register', 'forgotPassword'].map((section) => (
            <button
              key={section}
              onClick={() => {
                setActiveSection(section);
                // Clear response messages when switching sections
                setResponseMessages(prev => ({ ...prev, [section]: '' }));
              }}
              className={`flex-1 py-2 text-sm ${
                activeSection === section 
                  ? 'border-blue-600 border-b-2 font-medium text-blue-600' 
                  : 'text-gray-500'
              }`}
            >
              {section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </button>
          ))}
        </div>

        {renderSection()}

        {responseMessages[activeSection] && (
          <div className={`mt-4 text-center text-sm p-2 rounded ${
            responseMessages[activeSection].includes('successful') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {responseMessages[activeSection]}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;