import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import TopNav from './components/TopNav';
import LoadingScreen from './components/LoadingScreen';
import Home from './pages/Home';
import Credits from './pages/Credits';
import ManagementDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import brokenBladeBanner from './images/broken-blade-banner.png';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 1600);

    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <Router>
        <div
          className="bb-app-shell min-h-screen"
          style={{ '--bb-banner-url': `url(${brokenBladeBanner})` } as React.CSSProperties}
        >
          <TopNav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/management" element={<ManagementDashboard />} />
            <Route path="/admin" element={<Navigate to="/management" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
