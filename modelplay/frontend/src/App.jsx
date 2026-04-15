import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import LearningModule from './pages/LearningModule';
import MiniGame from './pages/MiniGame';
import { AuthProvider, AuthContext } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="min-h-screen bg-slate-900 flex justify-center items-center text-purple-400 font-bold text-xl tracking-widest animate-pulse">Initializing Neural Link...</div>;
    return user ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <AuthProvider>
        <Router>
          <div className="min-h-screen font-sans bg-slate-900 text-white selection:bg-purple-500/30 selection:text-purple-200">
            <main className="flex-1 flex flex-col h-full">
                <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/learn/decision-trees" element={<PrivateRoute><LearningModule /></PrivateRoute>} />
                    <Route path="/play/decision-trees" element={<PrivateRoute><MiniGame /></PrivateRoute>} />
                    <Route path="/" element={<Navigate to="/auth" />} />
                </Routes>
            </main>
          </div>
        </Router>
    </AuthProvider>
  );
}
export default App;
