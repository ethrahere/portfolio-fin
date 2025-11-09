import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import ThreeD from './pages/ThreeD';
import Apps from './pages/Apps';
import Music from './pages/Music';
import Essays from './pages/Essays';
import Project from './pages/Project';
import AdminEnhanced from './pages/AdminEnhanced';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/3d" element={<ThreeD />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/music" element={<Music />} />
          <Route path="/essays" element={<Essays />} />
          <Route path="/project/:category/:id" element={<Project />} />
          <Route path="/admin" element={<AdminEnhanced />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;