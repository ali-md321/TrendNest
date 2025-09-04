import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import trendNestLogo from '../../assets/BrandName.png';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebaseFrontend';
import { useDispatch } from 'react-redux';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { LoginUserAction } from '../../actions/userAction';
import Loading from '../Layouts/ButtonLoading';
import { toast } from 'react-toastify';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const [step, setStep] = useState(1);
  const [loginData, setLoginData] = useState({ phone: '', otp: '', role: 'Customer' });
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [resendVisible, setResendVisible] = useState(false);
  const intervalRef = useRef(null);

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    setupRecaptcha();
  }, []);

  useEffect(() => {
    if (step === 2 && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (step === 2 && timer === 0) {
      clearInterval(intervalRef.current);
      setResendVisible(true);
    }

    return () => clearInterval(intervalRef.current);
  }, [timer, step]);

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      {
        size: 'invisible',
        callback: () => console.log('reCAPTCHA solved'),
        'expired-callback': () => console.log('reCAPTCHA expired'),
      }
    );
  };

  const sendOtp = async () => {
    const phone = `+91${loginData.phone}`;
    try {
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep(2);
      setTimer(30);
      setResendVisible(false);
      console.log("OTP sent:", result);
    } catch (err) {
      console.error("OTP send error:", err);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    await sendOtp();
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setupRecaptcha();
    setLoading(true);
    await sendOtp();
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(loginData.otp);
      const idToken = await result.user.getIdToken();
      const res = await dispatch(LoginUserAction({ phone: loginData.phone, idToken, role: loginData.role }));
      if(!res.success){
        toast.error(res.error);
      }else navigate(redirect);
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Check console.");
    }
    setLoading(false);
  };

  const handleChangePhone = () => {
    setupRecaptcha();
    setStep(1);
    setLoginData({ otp: '' });
    setTimer(30);
    setResendVisible(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-3 sm:px-4 py-6">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Mobile Header - Only visible on small screens */}
        <div className="md:hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9Z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold">Welcome Back!</h2>
            <p className="text-sm text-blue-100 mt-1">Access your orders, wishlist and more</p>
          </div>
        </div>

        {/* Left Banner - Hidden on mobile */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9Z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">Welcome Back!</h2>
            <p className="text-blue-100 mb-6 text-sm leading-relaxed">Get access to your Orders, Wishlist and Recommendations</p>
            <div className="w-32 h-32 bg-white/10 rounded-full mx-auto backdrop-blur-sm flex items-center justify-center">
              <img src="/Logo.png" alt="Login" className="w-20 h-20 object-contain" />
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10">
          {/* Logo Section */}
          <div className="text-center mb-6 sm:mb-8">
            <img src={trendNestLogo} alt="TrendNest" className="h-8 sm:h-10 mx-auto mb-2" />
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto"></div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                step === 1 ? 'bg-blue-500 text-white shadow-lg' : 'bg-green-500 text-white'
              }`}>
                {step === 1 ? '1' : '✓'}
              </div>
              <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
                step === 2 ? 'bg-blue-500' : 'bg-gray-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                step === 2 ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
            </div>
          </div>

          <form onSubmit={step === 1 ? handleSendOTP : handleLogin} className="space-y-4 sm:space-y-6">
            {step === 1 ? (
              <>
                <div className="space-y-4 sm:space-y-5">
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter Email/Mobile number"
                      value={loginData.phone}
                      onChange={handleChange}
                      maxLength={10}
                      className="w-full border-0 border-b-2 border-gray-200 focus:border-blue-500 py-3 px-0 text-sm sm:text-base bg-transparent outline-none transition-colors duration-300 placeholder-gray-400"
                      required
                    />
                    <div className="absolute right-0 top-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      name="role"
                      value={loginData.role}
                      onChange={handleChange}
                      className="w-full border-0 border-b-2 border-gray-200 focus:border-blue-500 py-3 px-0 text-sm sm:text-base bg-transparent outline-none transition-colors duration-300 appearance-none cursor-pointer"
                    >
                      <option value="Customer">Customer</option>
                      <option value="Seller">Seller</option>
                      <option value="Deliverer">Deliverer</option>
                    </select>
                    <div className="absolute right-0 top-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border-l-4 border-blue-400">
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    By continuing, you agree to TrendNest's{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Terms of Use</a> and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Privacy Policy</a>.
                  </p>
                </div>

                <div id="recaptcha-container" />
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? <Loading text="Sending..." /> : 'Request OTP'}
                </button>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-5 border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6A2,2 0 0,0 20,4M20,8L12,13L4,8V6L12,11L20,6V8Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">Mobile Number</p>
                        <p className="text-sm font-bold text-green-700">+91 {loginData.phone}</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleChangePhone} 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                    >
                      Change?
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">OTP sent to mobile</span>
                    {resendVisible ? (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center gap-1"
                        disabled={loading}
                      >
                        {loading ? <Loading text="Sending..." /> : 'Resend?'}
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-blue-600 font-medium text-sm">Resend in {timer}s</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={loginData.otp}
                    onChange={handleChange}
                    className="w-full border-0 border-b-2 border-gray-200 focus:border-green-500 py-3 px-0 text-sm sm:text-base bg-transparent outline-none transition-colors duration-300 placeholder-gray-400 text-center text-xl tracking-widest font-mono"
                    required
                    maxLength={6}
                  />
                  <div className="absolute right-0 top-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? <Loading text="Logging in..." /> : 'Login'}
                </button>
              </>
            )}

            <div className="pt-4 sm:pt-6 border-t border-gray-100">
              <Link 
                to={`/signup?redirect=${encodeURIComponent(redirect)}`} 
                className="block w-full text-center py-3 sm:py-4 text-blue-600 hover:text-blue-800 font-medium border-2 border-blue-200 hover:border-blue-300 rounded-xl hover:bg-blue-50 transition-all duration-300 text-sm sm:text-base"
              >
                New to TrendNest? Create an account
              </Link>
            </div>
          </form>

          {/* Invisible reCAPTCHA */}
          <div id="recaptcha-container"></div>
        </div>
      </div>
    </div>
  );
}

export default Login;