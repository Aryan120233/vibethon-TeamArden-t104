import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';
import MiniGame from './pages/MiniGame';
import Quiz from './pages/Quiz';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="min-h-screen bg-slate-900 flex justify-center items-center text-purple-400 font-bold text-xl tracking-widest animate-pulse">Initializing Neural Link...</div>;
    return user ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen font-sans dark:bg-slate-900 dark:text-white bg-slate-50 text-slate-900 selection:bg-purple-500/30 selection:text-purple-200 transition-colors duration-300">
            <main className="flex-1 flex flex-col h-full">
                <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/learn/:slug" element={<PrivateRoute><ModulePage /></PrivateRoute>} />
                    <Route path="/play/decision-trees" element={<PrivateRoute><MiniGame /></PrivateRoute>} />
                    <Route path="/play/k-means-clustering" element={<PrivateRoute><KMeansPage /></PrivateRoute>} />
                    <Route path="/quiz/:slug" element={<PrivateRoute><Quiz /></PrivateRoute>} />
                    <Route path="/" element={<Navigate to="/auth" />} />
                </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

function KMeansPage() {
  const KMeansVisualizer = React.lazy(() => import('./pages/KMeansVisualizer'));
  return (
    <React.Suspense fallback={<div className="min-h-screen dark:bg-slate-900 bg-slate-50 flex items-center justify-center text-blue-400 animate-pulse font-bold">Loading K-Means Lab...</div>}>
      <KMeansVisualizer />
    </React.Suspense>
  );
}

export default App;
