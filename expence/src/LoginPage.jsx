import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import './LoginPage.css';


function LoginPage({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  
  // Store users in local storage to simulate a backend
  const [registeredUsers, setRegisteredUsers] = useState(
    JSON.parse(localStorage.getItem('expenseSplitterUsers')) || []
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username || !password || (isSignUp && !email)) {
      alert('Please fill in all fields');
      return;
    }

    if (isSignUp) {
      // Check if username already exists
      const userExists = registeredUsers.some(user => user.username === username);
      
      if (userExists) {
        alert('Username already exists. Please choose another.');
        return;
      }

      // Sign Up logic
      const newUser = {
        username,
        email,
        password
      };

      // Update registered users
      const updatedUsers = [...registeredUsers, newUser];
      setRegisteredUsers(updatedUsers);
      
      // Save to local storage
      localStorage.setItem('expenseSplitterUsers', JSON.stringify(updatedUsers));

      // Switch to login mode
      setIsSignUp(false);
      alert('Sign up successful! Please log in.');
      
      // Clear form
      setUsername('');
      setPassword('');
      setEmail('');

    } else {
      // Login logic
      const user = registeredUsers.find(
        u => u.username === username && u.password === password
      );

      if (user) {
        // Successful login
        onLogin(username);
      } else {
        // Failed login
        alert('Invalid username or password. Please try again or sign up.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{isSignUp ? 'Sign Up' : 'Expense Splitter Login'}</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          {isSignUp && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button type="submit" className="btn btn-primary">
            {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>
        
        <div className="login-toggle">
          {isSignUp 
            ? "Already have an account? " 
            : "Don't have an account? "}
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="toggle-link"
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </div>
        <div className='my_name'>
            Created by @Bunekunta Babu 21221
        </div>
      </div>
    </div>
  );
}

export default LoginPage;