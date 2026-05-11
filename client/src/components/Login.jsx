import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const API_URL = 'http://localhost:3001';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Fetch user by username
      const response = await fetch(`${API_URL}/users?username=${username}&website=${password}`);
      const users = await response.json();

      if (users.length === 0) {
        setError('User not found.');
        return;
      }

      const user = users[0];

      // 2. Validate password against the 'website' field as per instructions
      if (user.website !== password) {
        setError('Incorrect password.');
        return;
      }

      // 3. Success: Save user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // 4. Navigate to the user's home page
      navigate(`/users/${user.id}/home`);
    } catch (err) {
      setError('Server error. Make sure your json-server is running.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              className="form-control" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              placeholder="e.g. Bret"
            />
          </div>
          <div className="form-group">
            <label>Password (Website)</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="e.g. hildegard.org"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-primary">
            <LogIn size={20} /> Login
          </button>
        </form>
        <div className="text-center">
          <Link to="/register" className="link-text">Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  );
}
