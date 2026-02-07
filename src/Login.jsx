import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { Sparkles, ArrowLeft } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage(); // We might need to add validation strings to translations later

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await signUp(email, password);
                if (error) throw error;
                alert('Check your email for the login link!');
            } else {
                const { error } = await signIn(email, password);
                if (error) throw error;
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 relative">
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-8 left-8 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <ArrowLeft />
                </button>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#42f05f] to-[#2ecc71] rounded-xl flex items-center justify-center shadow-lg mb-4">
                        <Sparkles className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-[800] text-[var(--text-main)] font-heading">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-2">
                        {isSignUp ? 'Start your habit journey!' : 'Continue your evolution!'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl mb-4 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#42f05f] outline-none transition-all font-semibold"
                            placeholder="hello@habitmon.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#42f05f] outline-none transition-all font-semibold"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary mt-4 flex items-center justify-center h-12"
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm font-semibold text-[#8c36e2] hover:underline"
                    >
                        {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
