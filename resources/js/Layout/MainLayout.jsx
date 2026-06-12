import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    QrCode, 
    Users, 
    Calendar, 
    Banknote, 
    Settings, 
    LogOut, 
    Clock, 
    Building, 
    CheckCircle, 
    AlertCircle,
    X,
    Menu,
    Tag,
    RefreshCw
} from 'lucide-react';

export default function MainLayout({ children, title }) {
    const { url, props } = usePage();
    const { auth, flash = {} } = props;
    const [time, setTime] = useState(new Date());
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [toastType, setToastType] = useState('success');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Flash Message Listener
    useEffect(() => {
        if (flash.success) {
            setToastMsg(flash.success);
            setToastType('success');
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 4000);
            return () => clearTimeout(timer);
        } else if (flash.error) {
            setToastMsg(flash.error);
            setToastType('error');
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const formatTime = (date) => {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Scan Absensi', href: '/scanner', icon: QrCode },
        { name: 'Data Karyawan', href: '/employees', icon: Users },
        { name: 'Rekap Presensi', href: '/attendances', icon: Calendar },
        { name: 'Penggajian', href: '/payrolls', icon: Banknote },
        { name: 'Pengaturan', href: '/settings', icon: Settings },
        { name: 'Update Aplikasi', href: '/update', icon: RefreshCw },
    ];

    const isActive = (href) => {
        if (href === '/') return url === '/';
        return url.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex text-slate-800 antialiased font-sans">
            {/* Mobile Sidebar Backdrop Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 shadow-sm transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    {/* Brand/Header */}
                    <div className="h-14 border-b border-slate-100 flex items-center px-4 justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                                <span className="font-bold text-sm tracking-wider">GZ</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-xs leading-tight text-slate-900">SPPG MBG</h1>
                                <p className="text-[10px] text-slate-400 font-medium tracking-wide">Nutrition Portal</p>
                            </div>
                        </div>
                        {/* Close button for mobile menu */}
                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 lg:hidden border border-slate-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="p-2 space-y-0.5">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                                        active 
                                            ? 'bg-teal-50 text-teal-700 shadow-sm shadow-teal-500/5' 
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 transition-colors duration-150 ${active ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Footer User Info */}
                <div className="p-2 border-t border-slate-100 bg-slate-50/40">
                    <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shadow-inner border border-white">
                            A
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[11px] font-bold text-slate-900 truncate leading-none mb-0.5">{auth?.user?.name || 'Admin SPPG'}</p>
                            <p className="text-[9px] text-slate-500 truncate leading-none">{auth?.user?.email || 'admin@sppg.com'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-50/70 hover:text-rose-700 transition-all duration-150"
                    >
                        <LogOut className="w-3.5 h-3.5 shrink-0" />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 shadow-sm shadow-slate-100/50">
                    <div className="flex items-center">
                        {/* Hamburger toggle button on mobile */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-1 rounded-lg hover:bg-slate-50 border border-slate-200 text-slate-600 mr-2.5 lg:hidden"
                        >
                            <Menu className="w-4 h-4" />
                        </button>

                        {/* Page Title & Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-950">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span className="hidden sm:inline">SPPG Sukajadi Mandiri</span>
                            <span className="hidden sm:inline text-slate-300">/</span>
                            <span className="text-teal-700 font-semibold">{title}</span>
                        </div>
                    </div>

                    {/* Clock & Info Widget */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Version Tag Badge (similar to screenshot) */}
                        <Link 
                            href="/update"
                            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-md text-[10px] sm:text-[11px] font-semibold shadow-sm shadow-slate-950/10 transition-colors"
                        >
                            <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>Tag: <span className="text-white font-bold">{props.appVersion}-{props.appCommitHash}</span></span>
                            <svg className="w-2.5 h-2.5 text-slate-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 10l5 5 5-5H7z" />
                            </svg>
                        </Link>

                        <div className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-semibold text-slate-600">
                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-600 animate-pulse" />
                            <span className="text-slate-800 tabular-nums">{formatTime(time)}</span>
                            <span className="text-slate-300 hidden sm:inline">|</span>
                            <span className="hidden sm:inline">{formatDate(time)}</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-5 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* Notification Toast */}
            {showToast && (
                <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border shadow-lg animate-in slide-in-from-bottom-2 duration-300 max-w-sm ${
                    toastType === 'success' 
                        ? 'bg-teal-50 border-teal-200 text-teal-900' 
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                    {toastType === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="text-xs font-semibold leading-relaxed flex-1">{toastMsg}</span>
                    <button 
                        onClick={() => setShowToast(false)} 
                        className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-black/5"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}
