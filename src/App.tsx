import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Home from './pages/Home';
import ThreeD from './pages/ThreeD';
import Objects from './pages/Objects';
import Apps from './pages/Apps';
import Music from './pages/Music';
import Essays from './pages/Essays';
import Resources from './pages/Resources';
import Bio from './pages/Bio';
import Project from './pages/Project';
import Shop from './pages/Shop';
import ShopProject from './pages/ShopProject';
import AdminEnhanced from './pages/AdminEnhanced';
import ResetPassword from './pages/ResetPassword';
import Collaborate from './pages/Collaborate';

// Detects Supabase recovery tokens in the URL hash and redirects to /reset-password
const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      navigate('/reset-password' + hash, { replace: true });
    }
  }, [navigate]);
  return null;
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AuthRedirectHandler />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/3d" element={<ThreeD />} />
              <Route path="/objects" element={<Objects />} />
              <Route path="/apps" element={<Apps />} />
              <Route path="/music" element={<Music />} />
              <Route path="/essays" element={<Essays />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/bio" element={<Bio />} />
              <Route path="/project/:category/:id" element={<Project />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:slug" element={<ShopProject />} />
              <Route path="/collaborate" element={<Collaborate />} />

              <Route path="/admin" element={<AdminEnhanced />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;