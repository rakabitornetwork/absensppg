import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    Banknote, 
    Database,
    Settings, 
    LogOut, 
    Clock, 
    Building, 
    CheckCircle, 
    AlertCircle,
    X,
    Menu,
    RefreshCw,
    Heart,
    CookingPot,
    TrendingUp,
    ShieldCheck
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
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Data Karyawan', href: '/employees', icon: Users },
        { name: 'Target Distribusi', href: '/target-distribusi', icon: CookingPot },
        { name: 'Realisasi Distribusi', href: '/realisasi-distribusi', icon: TrendingUp },
        { name: 'Rekap Presensi', href: '/attendances', icon: Calendar },
        { name: 'Penggajian', href: '/payrolls', icon: Banknote },
        { name: 'Database', href: '/pemeliharaan-data', icon: Database },
        { name: 'Pengaturan', href: '/settings', icon: Settings },
        { name: 'Update Aplikasi', href: '/update', icon: RefreshCw },
        { name: 'Pengguna (RBAC)', href: '/users', icon: ShieldCheck },
    ];

    const userRole = auth?.user?.role || 'admin';
    const filteredNavigation = navigation.filter(item => {
        if (userRole === 'distributor') {
            return ['Dashboard', 'Target Distribusi', 'Realisasi Distribusi'].includes(item.name);
        }
        if (item.name === 'Pengguna (RBAC)' && userRole !== 'superadmin') {
            return false;
        }
        return true;
    });

    const isActive = (href) => {
        if (href === '/dashboard') return url === '/dashboard';
        return url.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-[#061A40] flex text-slate-800 antialiased font-sans">
            {/* Mobile Sidebar Backdrop Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.35),transparent_30%),linear-gradient(180deg,#061A40_0%,#0B2F6B_55%,#075985_100%)] border-r border-white/10 flex flex-col justify-between shrink-0 shadow-2xl shadow-blue-950/30 transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="min-h-0">
                    {/* Brand/Header */}
                    <div className="h-16 border-b border-white/10 flex items-center px-4 justify-between">
                        <div className="flex items-center gap-3">
                            {props.appLogo ? (
                                <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center overflow-hidden">
                                    <img src={props.appLogo} className="w-full h-full object-contain" alt="Logo" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-300 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                                    <span className="font-bold text-base tracking-wider">GZ</span>
                                </div>
                            )}
                            <div>
                                <h1 className="font-bold text-xs leading-tight text-white">{props.appTitle || 'SPPG MBG'}</h1>
                                <p className="text-[10px] text-blue-100/75 font-medium tracking-wide">{props.appSubtitle || 'Nutrition Portal'}</p>
                            </div>
                        </div>
                        {/* Close button for mobile menu */}
                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 rounded-lg hover:bg-white/10 text-blue-100 hover:text-white lg:hidden border border-white/10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-9rem)]">
                        {filteredNavigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                                        active 
                                            ? 'bg-white/[0.16] text-white shadow-sm shadow-sky-500/10 ring-1 ring-white/10' 
                                            : 'text-blue-100/78 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 transition-colors duration-150 ${active ? 'text-sky-200' : 'text-blue-200/65'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Sidebar Footer User Info */}
                <div className="p-2 border-t border-white/10 bg-blue-950/25">
                    <Link href="/profile" className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-lg hover:bg-white/10 transition-colors">
                        {auth?.user?.avatar_path ? (
                            <img
                                src={auth.user.avatar_path}
                                className="w-9 h-9 rounded-full object-cover shadow-inner border border-white/20"
                                alt={auth?.user?.name || 'Admin'}
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white text-sm font-bold shadow-inner border border-white/15">
                                {(auth?.user?.name || 'A').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <p className="text-[13px] font-bold text-white truncate leading-tight mb-0.5">{auth?.user?.name || 'Admin SPPG'}</p>
                            <p className="text-[11px] text-blue-100/65 truncate leading-tight">{auth?.user?.email || 'admin@sppg.com'}</p>
                        </div>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-950/20 transition-all duration-150"
                    >
                        <LogOut className="w-3.5 h-3.5 shrink-0" />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.18),transparent_28%),linear-gradient(135deg,#eff6ff_0%,#f8fafc_46%,#e0f2fe_100%)]">
                {/* Header */}
                <header className="h-14 bg-white/86 backdrop-blur-md border-b border-blue-100/70 flex items-center justify-between px-4 lg:px-6 shadow-sm shadow-blue-900/5">
                    <div className="flex items-center">
                        {/* Hamburger toggle button on mobile */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-1 rounded-lg hover:bg-blue-50 border border-blue-100 text-blue-800 mr-2.5 lg:hidden"
                        >
                            <Menu className="w-4 h-4" />
                        </button>

                        {/* Page Title & Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                            <Building className="w-3.5 h-3.5 text-blue-500" />
                            <span className="hidden sm:inline">{props.officeName}</span>
                            <span className="hidden sm:inline text-blue-200">/</span>
                            <span className="text-blue-700 font-semibold">{title}</span>
                        </div>
                    </div>

                    {/* Clock & Info Widget */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="bg-blue-50/80 border border-blue-100 rounded-lg px-2.5 py-1 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-semibold text-blue-700">
                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 animate-pulse" />
                            <span className="text-blue-950 tabular-nums">{formatTime(time)}</span>
                            <span className="text-blue-200 hidden sm:inline">|</span>
                            <span className="hidden sm:inline">{formatDate(time)}</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-5 overflow-y-auto flex flex-col justify-between">
                    <div className="flex-1">
                        {children}
                    </div>
                    <footer className="mt-8 pt-4 border-t border-blue-100/50 text-center text-xs text-slate-500/80 font-medium">
                        <p className="flex items-center justify-center gap-1.5">
                            <span>Copyright &copy; {new Date().getFullYear()}</span>
                            <span className="text-slate-300">&bull;</span>
                            <span className="flex items-center gap-1">
                                Dibuat dengan 
                                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 inline-block animate-pulse" /> 
                                oleh 
                                <a 
                                    href="https://teslatech.my.id" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="font-bold text-slate-700 hover:text-blue-500 transition-colors underline decoration-slate-300 decoration-1 underline-offset-2 hover:decoration-blue-400"
                                >
                                    amon
                                </a>
                            </span>
                        </p>
                    </footer>
                </main>
            </div>

            {/* Notification Toast */}
            {showToast && (
                <div className={`fixed top-4 right-4 z-50 flex max-w-sm items-center gap-2.5 rounded-full border px-4 py-2.5 shadow-xl shadow-slate-900/15 ${
                    toastType === 'success' 
                        ? 'bg-emerald-600 border-emerald-500 text-white' 
                        : 'bg-rose-600 border-rose-500 text-white'
                }`}>
                    {toastType === 'success' ? (
                        <CheckCircle className="w-4 h-4 shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span className="flex-1 text-xs font-bold leading-relaxed">{toastMsg}</span>
                    <button 
                        onClick={() => setShowToast(false)} 
                        className="rounded-full p-0.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}
