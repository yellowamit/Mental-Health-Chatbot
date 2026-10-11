import React from 'react';
import Chatbot from './Components/Chatbot/Chatbot';
import Navbar from './Components/Navbar/Navbar';
import Home from './Components/Home/Home';
import LoginSignup from './Components/LoginSignup/LoginSignup';
import Booking from './Components/Booking/Booking';
import { Route, Routes, BrowserRouter, Navigate, useLocation } from 'react-router-dom';
import Check from './Components/Check/Check';
import BeforeHome from './Components/BeforeHome/BeforeHome';

// ProtectedRoute component ensures user is signed in before accessing the chatbot
function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('auth-token');
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
          message: "Please sign in or create an account to start chatting with WellBot."
        }}
        replace
      />
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<BeforeHome />} />
        <Route path='/home' element={<Home />} />
        <Route path='/login' element={<LoginSignup />} />
        <Route
          path='/chatbot'
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />
        <Route path='/booking' element={<Booking />} />
        <Route
          path='/check'
          element={
            <ProtectedRoute>
              <Check />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;