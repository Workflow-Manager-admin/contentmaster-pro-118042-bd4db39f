import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

// PUBLIC_INTERFACE
const Dashboard = () => {
  const { user, logout, hasRole } = useAuth();

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Content Management Dashboard</h1>
          <div className="user-info">
            <span className="user-welcome">
              Welcome, {user.username}
            </span>
            <span className="user-role">
              Role: {user.role}
            </span>
            <button 
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <h3>Navigation</h3>
            <ul>
              <li>
                <a href="#dashboard" className="nav-link active">
                  📊 Dashboard
                </a>
              </li>
              
              {hasRole('viewer') && (
                <>
                  <li>
                    <a href="#posts" className="nav-link">
                      📝 Posts
                    </a>
                  </li>
                  <li>
                    <a href="#pages" className="nav-link">
                      📄 Pages
                    </a>
                  </li>
                  <li>
                    <a href="#media" className="nav-link">
                      🖼️ Media
                    </a>
                  </li>
                </>
              )}
              
              {hasRole('editor') && (
                <>
                  <li>
                    <a href="#tags" className="nav-link">
                      🏷️ Tags
                    </a>
                  </li>
                </>
              )}
              
              {hasRole('admin') && (
                <>
                  <li>
                    <a href="#users" className="nav-link">
                      👥 Users
                    </a>
                  </li>
                  <li>
                    <a href="#settings" className="nav-link">
                      ⚙️ Settings
                    </a>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </aside>

        <main className="main-content">
          <div className="content-header">
            <h2>Dashboard Overview</h2>
            <p>Manage your content from this central hub</p>
          </div>

          <div className="dashboard-grid">
            {hasRole('viewer') && (
              <>
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>📝 Posts</h3>
                  </div>
                  <div className="card-content">
                    <p>Create and manage blog posts</p>
                    <div className="card-stats">
                      <span className="stat-number">--</span>
                      <span className="stat-label">Total Posts</span>
                    </div>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>📄 Pages</h3>
                  </div>
                  <div className="card-content">
                    <p>Manage static pages</p>
                    <div className="card-stats">
                      <span className="stat-number">--</span>
                      <span className="stat-label">Total Pages</span>
                    </div>
                  </div>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>🖼️ Media</h3>
                  </div>
                  <div className="card-content">
                    <p>Upload and organize media files</p>
                    <div className="card-stats">
                      <span className="stat-number">--</span>
                      <span className="stat-label">Media Files</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {hasRole('editor') && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>🏷️ Tags</h3>
                </div>
                <div className="card-content">
                  <p>Organize content with tags</p>
                  <div className="card-stats">
                    <span className="stat-number">--</span>
                    <span className="stat-label">Tags Created</span>
                  </div>
                </div>
              </div>
            )}

            {hasRole('admin') && (
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>👥 Users</h3>
                </div>
                <div className="card-content">
                  <p>Manage user accounts and permissions</p>
                  <div className="card-stats">
                    <span className="stat-number">--</span>
                    <span className="stat-label">Total Users</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-icon">📝</span>
                <div className="activity-content">
                  <p>Welcome to your dashboard!</p>
                  <small>Start by exploring the navigation menu</small>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
