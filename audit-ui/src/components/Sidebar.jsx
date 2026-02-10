import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, List, Shield, Settings, Activity, AlertCircle } from 'lucide-react';
import AuditService from '../services/AuditService';

const Sidebar = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                // Try to fetch logs to verify backend connectivity
                await AuditService.getAllLogs();
                setIsConnected(true);
            } catch (error) {
                console.error("Backend connection failed", error);
                setIsConnected(false);
            } finally {
                setChecking(false);
            }
        };

        checkConnection();
        // Poll every 30 seconds
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="sidebar flex flex-col justify-between h-full bg-slate-900 border-r border-slate-700/50">
            <div>
                {/* Logo Area */}
                <div className="flex items-center gap-3 px-6 mb-8 mt-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Shield className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-wide m-0">MedChain</h1>
                        <span className="text-xs text-blue-400 font-medium">AUDIT SYSTEM</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2 px-4">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-2">Platform</div>

                    <NavLink to="/" className={({ isActive }) =>
                        `nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-500/10 text-blue-400 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`
                    }>
                        <Home size={20} />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink to="/logs" className={({ isActive }) =>
                        `nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-500/10 text-blue-400 font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`
                    }>
                        <List size={20} />
                        <span>Audit Trails</span>
                    </NavLink>
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-700/50">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border ${isConnected ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                    {checking ? (
                        <Activity size={20} className="text-yellow-400 animate-pulse" />
                    ) : isConnected ? (
                        <Activity size={20} className="text-green-400" />
                    ) : (
                        <AlertCircle size={20} className="text-red-400" />
                    )}
                    <div className="text-sm">
                        <div className={`font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                            {checking ? 'Checking...' : isConnected ? 'System Online' : 'Offline'}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                            {!checking && (
                                <>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400'}`}></span>
                                    {isConnected ? 'Backend Connected' : 'No Connection'}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-xs text-slate-600 text-center mt-4">
                    v1.0.0 • Secured by Blockchain
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
