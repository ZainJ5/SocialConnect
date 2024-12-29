// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './Pages/MainPage';
import Login from './Pages/Login';
import ProtectedRoute from './Components/ProtectedRoute';
import UserPage from './Components/UserPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/main" replace />} />
        
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/main" 
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route 
          path="/user/:email" 
          element={<UserPage apiKey={"YOUR API KEY (GEMINI)"} />} 
        />
      </Routes>
    </Router>
  );
};

export default App;