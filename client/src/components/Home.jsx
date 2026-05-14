import { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link, useParams, useLocation, Navigate } from 'react-router-dom';
import { Info, CheckSquare, FileText, Image as ImageIcon, LogOut, User } from 'lucide-react';
import Todos from './Todos';
import Posts from './Posts';
import Albums from './Albums';

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();

  useEffect(() => {
    // Check local storage for authenticated user
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    
    // Protection against accessing other user's routes
    // If we're on /users/:id but the id doesn't match our logged-in user, redirect them to their own page
    if (userId && parsedUser.id.toString() !== userId) {
      navigate(`/users/${parsedUser.id}/info`);
      return;
    }
    
    // If they hit the legacy /home route without an ID, redirect to their informative URL
    if (!userId) {
      navigate(`/users/${parsedUser.id}/info`);
      return;
    }
    
    setUser(parsedUser);
  }, [navigate, userId]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (!user) return null; // Or a loading spinner

  // Determine which tab is active based on the URL
  const currentTab = location.pathname.split('/').pop();

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="nav-brand">
          <User className="text-primary" size={24} style={{ color: 'var(--primary)' }} />
          <span className="nav-brand-text">{user.name}</span>
        </div>
        
        <div className="nav-links">
          <Link to={`/users/${user.id}/info`} className={`nav-link ${currentTab === 'info' ? 'active' : ''}`}>
            <Info size={18} /> Info
          </Link>
          <Link to={`/users/${user.id}/todos`} className={`nav-link ${currentTab === 'todos' ? 'active' : ''}`}>
            <CheckSquare size={18} /> To-Dos
          </Link>
          <Link to={`/users/${user.id}/posts`} className={`nav-link ${currentTab === 'posts' ? 'active' : ''}`}>
            <FileText size={18} /> Posts
          </Link>
          <Link to={`/users/${user.id}/albums`} className={`nav-link ${currentTab === 'albums' ? 'active' : ''}`}>
            <ImageIcon size={18} /> Albums
          </Link>
        </div>

        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <main className="main-content">
        {/* Nested routes for the specific tabs */}
        <Routes>
          <Route index element={<Navigate to="info" replace />} />
          <Route path="info" element={
            <div>
              <h2 className="page-title">Personal Information</h2>
              <div className="auth-card" style={{ maxWidth: '800px', margin: '0' }}>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Full Name</div>
                    <div className="info-value">{user.name}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Username</div>
                    <div className="info-value">{user.username}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Email Address</div>
                    <div className="info-value">{user.email || 'N/A'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Phone</div>
                    <div className="info-value">{user.phone || 'N/A'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Website (Password)</div>
                    <div className="info-value">{user.website}</div>
                  </div>
                </div>
              </div>
            </div>
          } />
          
          {/* Feature Routes */}
          <Route path="todos" element={<Todos />} />
          <Route path="posts" element={<Posts />} />
          <Route path="albums" element={<Albums />} />
        </Routes>
      </main>
    </div>
  );
}
