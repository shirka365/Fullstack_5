import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Route that contains the app shell and user-specific nested routes */}
      <Route path="/users/:userId/*" element={<Home />} />
      
      {/* Legacy home route fallback, redirects to login if no user in LS */}
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;
