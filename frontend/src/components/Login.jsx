import { useState } from 'react';
import { loginUser, registerUser, trackEvent } from '../api';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isRegister) {
        if (!age) {
          setError('Age is required');
          setLoading(false);
          return;
        }
        data = await registerUser(username, password, age, gender);
      } else {
        data = await loginUser(username, password);
      }

      localStorage.setItem('token', data.access_token);

      // Track login/register event after token is stored
      trackEvent(isRegister ? 'register' : 'login');

      onLogin(data.access_token);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="login-logo">📊</div>
          <h1 className="login-title">Analytics Dashboard</h1>
          <p className="login-subtitle">
            {isRegister ? 'Create your account' : 'Sign in to continue'}
          </p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Username</label>
            <input
              id="input-username"
              type="text"
              className="input-field"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input
              id="input-password"
              type="password"
              className="input-field"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label className="label">Age</label>
                <input
                  id="input-age"
                  type="number"
                  className="input-field"
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Gender</label>
                <select
                  id="select-gender-register"
                  className="input-field"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </>
          )}

          <button id="btn-submit" className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="login-toggle">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <span onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Sign In' : 'Register'}
          </span>
        </div>
      </div>
    </div>
  );
}
