import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased font-sans relative overflow-hidden">
            <Head title="Masuk" />
            
            {/* Background Decorative Gradient Rings */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

            <div className="w-full max-w-[380px] bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/50 p-6 z-10">
                {/* Brand Logo */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-600/20 mb-3 animate-pulse">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-base font-bold text-slate-900 leading-tight">SPPG Absensi & Payroll</h1>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Program Makan Bergizi Gratis (MBG) Indonesia
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1" htmlFor="email">
                            Email Administrator
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Mail className="w-3.5 h-3.5" />
                            </span>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`w-full text-xs pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-all duration-150 ${
                                    errors.email 
                                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' 
                                        : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/20'
                                }`}
                                placeholder="nama@sppg.com"
                                required
                            />
                        </div>
                        {errors.email && (
                            <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1" htmlFor="password">
                            Kata Sandi
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Lock className="w-3.5 h-3.5" />
                            </span>
                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`w-full text-xs pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-all duration-150 ${
                                    errors.password 
                                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' 
                                        : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/20'
                                }`}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {errors.password && (
                            <p className="text-[10px] text-rose-600 mt-1 font-semibold">{errors.password}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20"
                            />
                            <span className="text-[10px] text-slate-500 font-bold">Ingat saya</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg shadow-teal-600/10 hover:shadow-teal-600/20 active:translate-y-[1px] transition-all duration-150 flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            'Masuk Aplikasi'
                        )}
                    </button>
                </form>

                {/* Info Credentials for Demo */}
                <div className="mt-5 p-3 rounded-lg bg-teal-50/50 border border-teal-100/60 text-[10px] text-teal-900">
                    <p className="font-bold mb-1">Informasi Akun Demo:</p>
                    <p>Email: <span className="font-semibold select-all">admin@sppg.com</span></p>
                    <p>Sandi: <span className="font-semibold select-all">12345678</span></p>
                </div>
            </div>
        </div>
    );
}
