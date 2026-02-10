import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AuditLogs from './pages/AuditLogs';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#0f172a', position: 'relative' }}>
          {/* Background Gradient Effect */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 40%)', pointerEvents: 'none' }}></div>

          <div style={{ padding: '2rem', position: 'relative', zIndex: 10, minHeight: '100vh' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/logs" element={<AuditLogs />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
