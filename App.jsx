import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import RecommendationPage from './pages/RecommendationPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-indigo-800 to-indigo-600 text-white font-sans">
        
        {/* --- Navigation Bar --- */}
        <nav className="flex justify-between items-center p-6 shadow-lg bg-white/10 backdrop-blur-xl border-b border-white/20">
          {/* App Title */}
          <h1 className="text-2xl font-extrabold tracking-wide drop-shadow-md">
            **FurniAI Hub**
          </h1>

          {/* Navigation Links */}
          <div className="flex space-x-6 text-lg font-semibold">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `px-3 py-1 rounded-lg transition-colors duration-300 ${
                  isActive ? 'bg-indigo-500/50' : 'hover:bg-indigo-500/30'
                }`
              }
            >
              Recommendations
            </NavLink>
            <NavLink 
              to="/analytics" 
              className={({ isActive }) => 
                `px-3 py-1 rounded-lg transition-colors duration-300 ${
                  isActive ? 'bg-indigo-500/50' : 'hover:bg-indigo-500/30'
                }`
              }
            >
              Analytics
            </NavLink>
          </div>
        </nav>

        {/* --- Main Content --- */}
        <main className="flex-1 p-6 sm:p-10">
          <Routes>
            <Route path="/" element={<RecommendationPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </main>

        {/* --- Footer --- */}
        <footer className="text-center p-4 bg-white/10 backdrop-blur-xl border-t border-white/20 text-indigo-200 font-light">
          © {new Date().getFullYear()} FurniAI Hub. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;
