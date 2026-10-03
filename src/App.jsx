import React, { useState } from 'react';
import EnhancedLoginForm from './EnhancedLoginForm';
import EnhancedRegistrationForm from './EnhancedRegistrationForm';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'inline-flex',
            background: '#e2e8f0',
            padding: '4px',
            borderRadius: '10px',
            gap: '4px'
          }}
        >
          <button
            onClick={() => setActiveTab('login')}
            style={{
              padding: '0.6rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'login' ? '#ffffff' : 'transparent',
              color: activeTab === 'login' ? '#2563eb' : '#64748b',
              boxShadow: activeTab === 'login' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            🔒 Enhanced Login Form
          </button>
          <button
            onClick={() => setActiveTab('register')}
            style={{
              padding: '0.6rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'register' ? '#ffffff' : 'transparent',
              color: activeTab === 'register' ? '#2563eb' : '#64748b',
              boxShadow: activeTab === 'register' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            📝 Enhanced Registration Form
          </button>
        </div>
      </div>

      {/* Render Active Form Component */}
      {activeTab === 'login' ? <EnhancedLoginForm /> : <EnhancedRegistrationForm />}
    </div>
  );
}

export default App;