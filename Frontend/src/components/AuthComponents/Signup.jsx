import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { auth } from '../../config/firebaseFrontend';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { useDispatch } from 'react-redux';
import trendNestLogo from '../../assets/BrandName.png';
import { Link, useNavigate } from 'react-router-dom';
import { registerUserAction } from '../../actions/userAction';
import Loading from '../Layouts/ButtonLoading';

function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    otp: '',
    role: 'Customer',

    // Seller fields
    shopName: '',
    gstNumber: '',
    businessAddress: '',

    // Deliverer fields
    vehicleType: '',
    licenseNumber: '',

  });

  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    setupRecaptcha();
  }, []);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev === 1) setCanResend(true);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => console.log('reCAPTCHA solved'),
      'expired-callback': () => console.log('reCAPTCHA expired'),
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setupRecaptcha();
    const phone = `+91${form.phone}`;
    try {
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep(2);
      setTimer(30);
      setCanResend(false);
    } catch (err) {
      console.error('OTP Send Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(form.otp);
      const idToken = await result.user.getIdToken();
      let roleData = {};
      if (form.role === "Seller") {
        roleData = {
          shopName: form.shopName,
          gstNumber: form.gstNumber,
          businessAddress: form.businessAddress,
        };
      } else if (form.role === "Deliverer") {
        roleData = {
          vehicleType: form.vehicleType,
          licenseNumber: form.licenseNumber,
        };
      }
      const {success} = await dispatch(registerUserAction({name: form.name,email: form.email,phone: form.phone,idToken,role: form.role,roleData}));
      if(success) navigate(redirect);
      else navigate("/signup");
    } catch (err) {
      console.error('Verification Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = () => {
    setStep(1);
    setForm({ ...form, otp: '' });
    setTimer(30);
    setCanResend(false);
    setupRecaptcha();
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(30);
    setLoading(true);
    try {
      setupRecaptcha();
      const phone = `+91${form.phone}`;
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmationResult(result);
    } catch (err) {
      console.error('Resend OTP Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center px-3 sm:px-4 py-6">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Mobile Header - Only visible on small screens */}
        <div className="md:hidden bg-gradient-to-r from-purple-600 to-pink-700 text-white p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9Z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold">Join TrendNest!</h2>
            <p className="text-sm text-purple-100 mt-1">Access exclusive deals & products</p>
          </div>
        </div>

        {/* Left Banner - Hidden on mobile */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-purple-600 to-pink-700 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 14C17.67 14 23 15.33 23 18V20H7V18C7 15.33 12.33 14 15 14M15 12C12.79 12 11 10.21 11 8S12.79 4 15 4 19 5.79 19 8 17.21 12 15 12M7 10C9.21 10 11 8.21 11 6S9.21 2 7 2 3 3.79 3 6 4.79 10 7 10M7 12C4.33 12 1 13.33 1 16V18H5V16C5 14.9 6.1 13.8 7.4 13.25C7.27 12.87 7.2 12.45 7.2 12H7Z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">Join TrendNest!</h2>
            <p className="text-purple-100 mb-6 text-sm leading-relaxed">Access exclusive deals, wishlist your favorites, and join our community</p>
            <div className="w-32 h-32 bg-white/10 rounded-full mx-auto backdrop-blur-sm flex items-center justify-center">
              <img src="/Logo.png" alt="Signup" className="w-20 h-20 object-contain" />
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10">
          {/* Logo Section */}
          <div className="text-center mb-6 sm:mb-8">
            <img src={trendNestLogo} alt="TrendNest" className="h-8 sm:h-10 mx-auto mb-2" />
            <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                step === 1 ? 'bg-purple-500 text-white shadow-lg' : 'bg-green-500 text-white'
              }`}>
                {step === 1 ? '1' : '✓'}
              </div>
              <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
                step === 2 ? 'bg-purple-500' : 'bg-gray-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                step === 2 ? 'bg-purple-500 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
            </div>
          </div>

          <form onSubmit={step === 1 ? sendOtp : verifyOtp} className="space-y-4 sm:space-y-5">
            {step === 1 ? (
              <>
                <div className="space-y-4 sm:space-y-5">
                  {/* Basic Fields */}
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full border-0 border-b-2 border-gray-200 focus:border-purple-500 py-3 px-0 text-sm sm:text-base bg-transparent outline-none transition-colors duration-300 placeholder-gray-400"
                    />
                    <div className="absolute right-0 top-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full border-0 border-b-2 border-gray-200 focus:border-purple-500 py-3 px-0 text-sm sm:text-base bg-transparent outline-none transition-colors duration-300 placeholder-gray-400"
                    />
                    <div className="absolute right-0 top-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Mobile Number"
                      value={form.phone}
                      onChange={handleChange}
                      maxLength={10}
                      required
                      className="w-full border-0 border-b-2 border-gray-200 focus:border-purple-500 py-3 px-0 text-sm sm:text-base bg-transparent outline-none transition-colors duration-300 placeholder-gray-400"
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
                      value={form.role}
                      onChange={handleChange}
                      className="w-full border-0 border-b-2 border-gray-200 focus:border-purple-500 py-3 px-0 text-sm sm:text-base bg-transparent outline-none transition-colors duration-300 appearance-none cursor-pointer"
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

                  {/* Role-specific Fields */}
                  {form.role === 'Seller' && (
                    <div className="bg-blue-50 rounded-lg p-4 sm:p-5 border border-blue-200 space-y-4">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">Seller Information</h4>
                      
                      <div className="relative">
                        <input
                          type="text"
                          name="shopName"
                          placeholder="Shop Name"
                          value={form.shopName}
                          onChange={handleChange}
                          required
                          className="w-full border-0 border-b-2 border-blue-200 focus:border-blue-500 py-2 px-0 text-sm bg-transparent outline-none transition-colors duration-300 placeholder-gray-500"
                        />
                      </div>
                      
                      <div className="relative">
                        <input
                          type="text"
                          name="gstNumber"
                          placeholder="GST Number"
                          value={form.gstNumber}
                          onChange={handleChange}
                          required
                          className="w-full border-0 border-b-2 border-blue-200 focus:border-blue-500 py-2 px-0 text-sm bg-transparent outline-none transition-colors duration-300 placeholder-gray-500"
                        />
                      </div>
                      
                      <div className="relative">
                        <input
                          type="text"
                          name="businessAddress"
                          placeholder="Business Address"
                          value={form.businessAddress}
                          onChange={handleChange}
                          required
                          className="w-full border-0 border-b-2 border-blue-200 focus:border-blue-500 py-2 px-0 text-sm bg-transparent outline-none transition-colors duration-300 placeholder-gray-500"
                        />
                      </div>
                    </div>
                  )}

                  {form.role === 'Deliverer' && (
                    <div className="bg-green-50 rounded-lg p-4 sm:p-5 border border-green-200 space-y-4">
                      <h4 className="text-sm font-semibold text-green-800 mb-2">Delivery Partner Information</h4>
                      
                      <div className="relative">
                        <select
                          name="vehicleType"
                          value={form.vehicleType}
                          onChange={handleChange}
                          required
                          className="w-full border-0 border-b-2 border-green-200 focus:border-green-500 py-2 px-0 text-sm bg-transparent outline-none transition-colors duration-300 appearance-none cursor-pointer"
                        >
                          <option value="">Select Vehicle Type</option>
                          <option value="Bike">Bike</option>
                          <option value="Scooter">Scooter</option>
                          <option value="Car">Car</option>
                          <option value="Van">Van</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="absolute right-0 top-2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="text"
                          name="licenseNumber"
                          placeholder="License Number"
                          value={form.licenseNumber}
                          onChange={handleChange}
                          required
                          className="w-full border-0 border-b-2 border-green-200 focus:border-green-500 py-2 px-0 text-sm bg-transparent outline-none transition-colors duration-300 placeholder-gray-500"
                        />
                      </div>
                    </div>
                  )}

                </div>

                <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border-l-4 border-purple-400">
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    By continuing, you agree to TrendNest's{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-800 font-medium">Terms of Use</a> and{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-800 font-medium">Privacy Policy</a>.
                  </p>
                </div>

                <div id="recaptcha-container" className="hidden" />
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? <Loading /> : 'Send OTP'}
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
                        <p className="text-sm font-bold text-green-700">+91 {form.phone}</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleChangePhone} 
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                    >
                      Change?
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">OTP sent to your number</span>
                    <button
                      type="button"
                      className={`text-purple-600 hover:text-purple-800 font-medium text-sm px-3 py-1 rounded-lg hover:bg-purple-50 transition-colors duration-200 flex items-center gap-1 ${!canResend && 'opacity-50 cursor-not-allowed hover:bg-transparent'}`}
                      onClick={handleResend}
                      disabled={!canResend}
                    >
                      {canResend ? 'Resend?' : (
                        <>
                          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-1"></div>
                          {`Resend in ${timer}s`}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={form.otp}
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
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? <Loading /> : 'Verify & Create Account'}
                </button>
              </>
            )}

            <div className="pt-4 sm:pt-6 border-t border-gray-100">
              <Link 
                to={`/login?redirect=${encodeURIComponent(redirect)}`} 
                className="block w-full text-center py-3 sm:py-4 text-purple-600 hover:text-purple-800 font-medium border-2 border-purple-200 hover:border-purple-300 rounded-xl hover:bg-purple-50 transition-all duration-300 text-sm sm:text-base"
              >
                Already have an account? Login here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;