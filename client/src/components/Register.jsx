import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, UserPlus } from 'lucide-react';

const API_URL = 'http://localhost:3001';

export default function Register() {
  const [step, setStep] = useState(1);
  
  // Step 1 states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  
  // Step 2 states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStepOne = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== verifyPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Check if username is already taken
      const response = await fetch(`${API_URL}/users?username=${username}`);
      const users = await response.json();

      if (users.length > 0) {
        setError('Username is already taken.');
        return;
      }

      // Username is unique, proceed to step 2
      setStep(2);
    } catch (err) {
      setError('Server error.');
    }
  };

  const handleStepTwo = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const newUser = {
        name,
        username,
        email,
        website: password // Using website field as password as instructed
      };

      // Create new user in the DB
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      const createdUser = await response.json();

      // Automatically log them in
      localStorage.setItem('currentUser', JSON.stringify(createdUser));
      navigate(`/users/${createdUser.id}/info`);
      
    } catch (err) {
      setError('Error creating user.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account (Step {step}/2)</h2>
        
        {step === 1 ? (
          <form onSubmit={handleStepOne}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Verify Password</label>
              <input type="password" className="form-control" value={verifyPassword} onChange={e => setVerifyPassword(e.target.value)} required />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn-primary">
              Next Step <ArrowRight size={20} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleStepTwo}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn-primary">
              <UserPlus size={20} /> Complete Registration
            </button>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="link-text">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
}
