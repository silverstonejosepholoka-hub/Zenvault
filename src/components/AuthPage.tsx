import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, ChevronRight, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import { Button, Card } from './UI';
import { cn } from '@/src/lib/utils';
import { auth } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { dataService } from '../services/dataService';
import { APP_LOGO_URL } from '../constants';

type AuthStep = 'welcome' | 'email-setup' | 'phone-setup' | 'otp' | 'security' | 'pin-setup' | 'success';

export function AuthPage({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<AuthStep>('welcome');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setEmail(result.user.email || '');
      
      // Check if user already has a profile with completed setup
      const profile = await dataService.getUserProfile(result.user.uid);
      if (profile && profile.securitySetup && profile.phoneNumber) {
        onComplete();
      } else if (profile && profile.phoneNumber) {
        setStep('security');
      } else {
        // Must provide phone number next
        setStep('phone-setup');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (step === 'phone-setup') {
      const container = document.getElementById('recaptcha-container');
      if (container && !container.innerHTML) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
      }
    }
  }, [step]);

  const handleEmailAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (e: any) {
        if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw e;
        }
      }
      
      const user = auth.currentUser;
      if (user) {
        const profile = await dataService.getUserProfile(user.uid);
        if (profile?.phoneNumber) {
          setStep('security');
        } else {
          setStep('phone-setup');
        }
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    if (!confirmationResult) return;
    setIsLoading(true);
    setError(null);
    try {
      await confirmationResult.confirm(code);
      setStep('security');
    } catch (e: any) {
      setError('Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityFinish = async (biometric: boolean) => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Authentication lost. Please try again.');
      }

      // Initialize profile and first account
      await dataService.createUserProfile({
        uid: user.uid,
        email: user.email || email,
        phoneNumber: user.phoneNumber || phone,
        biometricEnabled: biometric,
        securitySetup: true,
        pinHash: pin 
      });

      // Create a default USD account
      await dataService.createAccount({
        currency: 'USD',
        balance: 1000.00, // Welcome bonus
        label: 'Primary Vault',
        type: 'wallet'
      });

      setStep('success');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 max-w-lg mx-auto w-full">
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col justify-center gap-8 py-12"
          >
            <div className="space-y-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-primary-600 rounded-[28px] flex items-center justify-center p-4 shadow-2xl shadow-primary-200 overflow-hidden">
                <img 
                  src={APP_LOGO_URL} 
                  alt="ZenVault Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>');
                  }}
                />
              </div>
              <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-[0.95]">
                Wealth that <br />
                <span className="text-primary-600 text-6xl">works.</span>
              </h1>
              <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-[280px]">
                The premier way to manage, grow and secure your capital.
              </p>
            </div>

            <div className="space-y-4 mt-auto">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 text-rose-600 text-sm animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <Button 
                  className="w-full py-5 text-lg rounded-[24px] bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-100" 
                  onClick={() => setStep('email-setup')}
                >
                  Create Your Account
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full py-5 text-lg rounded-[24px] border-2 border-slate-100 bg-white hover:bg-slate-50 text-slate-700 gap-3" 
                  onClick={handleGoogleAuth}
                  isLoading={isLoading}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </Button>
              </div>

              <div id="recaptcha-container"></div>
              
              <button 
                onClick={() => setStep('email-setup')} 
                className="w-full py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-primary-600 transition-colors"
              >
                Already a member? <span className="text-primary-600">Log In</span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 'email-setup' && (
          <motion.div
            key="email-setup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col pt-12"
          >
            <h2 className="text-3xl font-black mb-2 tracking-tight">Step 1 of 2: <br/>Email Auth</h2>
            <p className="text-slate-500 font-medium text-sm mb-8">Access your vault with your email address.</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6">
                  Email Address
                </label>
                <input 
                  autoFocus
                  type="email"
                  placeholder="hello@zenvault.app"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] px-8 py-5 outline-none focus:border-primary-500 focus:bg-white transition-all text-xl font-bold placeholder:text-slate-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6">
                  Vault Password
                </label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] px-8 py-5 outline-none focus:border-primary-500 focus:bg-white transition-all text-xl font-bold placeholder:text-slate-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 text-rose-600 text-xs">
                <AlertCircle size={16} className="flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <Button 
              className="mt-10 py-5 gap-3 rounded-[24px] bg-primary-600 hover:bg-primary-700" 
              isLoading={isLoading} 
              disabled={!email || !password}
              onClick={handleEmailAuth}
            >
              Continue to Step 2 <ChevronRight size={20} />
            </Button>
          </motion.div>
        )}

        {step === 'phone-setup' && (
          <motion.div
            key="phone-setup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col pt-12"
          >
            <h2 className="text-3xl font-black mb-2 tracking-tight">Step 2 of 2: <br/>Phone Security</h2>
            <p className="text-slate-500 font-medium text-sm mb-8">We'll send a secure OTP to verify your identity.</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-6">
                  Phone Number
                </label>
                <input 
                  autoFocus
                  type="tel"
                  placeholder="+256 700 000000"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] px-8 py-5 outline-none focus:border-primary-500 focus:bg-white transition-all text-xl font-bold placeholder:text-slate-300"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 text-rose-600 text-xs">
                <AlertCircle size={16} className="flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <Button 
              className="mt-10 py-5 gap-3 rounded-[24px] bg-primary-600 hover:bg-primary-700" 
              isLoading={isLoading} 
              disabled={!phone}
              onClick={handlePhoneSubmit}
            >
              Send OTP Code <ChevronRight size={20} />
            </Button>
            <div id="recaptcha-container" className="mt-4"></div>
          </motion.div>
        )}

        {step === 'otp' && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col pt-12"
          >
            <h2 className="text-2xl font-bold mb-2">Verify phone</h2>
            <p className="text-slate-400 text-sm mb-8">Enter the 6-digit code sent to {phone}.</p>

            <div className="flex justify-between gap-2 mb-8">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input 
                  key={i}
                  type="text"
                  maxLength={1}
                  className="w-10 h-14 bg-slate-50 border-2 border-slate-100 rounded-xl text-center text-xl font-black outline-none focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                  onKeyUp={(e) => {
                    const val = (e.target as HTMLInputElement).value;
                    if (val && i < 5) {
                      (e.currentTarget.nextSibling as HTMLInputElement)?.focus();
                    }
                    if (i === 5 && val) {
                      const inputs = e.currentTarget.parentElement?.querySelectorAll('input');
                      const code = Array.from(inputs || []).map(input => (input as HTMLInputElement).value).join('');
                      if (code.length === 6) verifyOtp(code);
                    }
                  }}
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-xs text-rose-600 font-bold mb-4">{error}</p>
            )}

            <p className="text-center text-sm text-slate-400 mb-8">
              Didn't receive the code? <button className="text-primary-600 font-bold" onClick={handlePhoneSubmit}>Resend</button>
            </p>

            <Button 
              className="py-4" 
              isLoading={isLoading} 
              onClick={() => {
                const inputs = document.querySelectorAll('input');
                const code = Array.from(inputs).map(input => (input as HTMLInputElement).value).join('');
                if (code.length === 6) verifyOtp(code);
              }}
            >
              Verify Code
            </Button>
          </motion.div>
        )}

        {step === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col pt-12"
          >
            <h2 className="text-2xl font-bold mb-2">Secure your wallet</h2>
            <p className="text-slate-400 text-sm mb-8">Add an extra layer of protection to your assets.</p>

            <Card className="p-6 space-y-4 shadow-xl border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl">
                    <Fingerprint size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Biometric Access</p>
                    <p className="text-xs text-slate-400">Fingerprint or Face ID</p>
                  </div>
                </div>
                <Toggle defaultChecked />
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex items-center justify-between" onClick={() => setStep('pin-setup')}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl">
                    <Lock size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Vault PIN</p>
                    <p className="text-xs text-slate-400">{pin ? 'PIN is set' : 'Required for transactions'}</p>
                  </div>
                </div>
                {pin ? <CheckCircle2 className="text-green-500" size={20} /> : <ChevronRight size={20} className="text-slate-300" />}
              </div>
            </Card>

            <p className="text-slate-400 text-[10px] text-center mt-6 px-12 leading-relaxed">
              By enabling biometrics, you agree to our <span className="text-slate-900 font-bold">Security Terms</span> and policies.
            </p>

            <Button 
              className="mt-auto py-4" 
              isLoading={isLoading} 
              disabled={!pin}
              onClick={() => handleSecurityFinish(true)}
            >
              Finish Setup
            </Button>
          </motion.div>
        )}

        {step === 'pin-setup' && (
          <motion.div
            key="pin-setup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col pt-12"
          >
            <h2 className="text-2xl font-bold mb-2">Set Vault PIN</h2>
            <p className="text-slate-400 text-sm mb-8">Enter a 4-digit PIN to secure your capital.</p>

            <div className="flex justify-center gap-4 mb-12">
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className={cn(
                    "w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center",
                    pin.length > i ? "bg-primary-600 border-primary-600 shadow-lg shadow-primary-200" : "bg-white border-slate-200"
                  )}
                >
                  {pin.length > i && <div className="w-3 h-3 bg-white rounded-full" />}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-xs mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <button 
                  key={n} 
                  className="w-16 h-16 rounded-full bg-slate-50 text-slate-900 text-xl font-black hover:bg-slate-100 transition-colors"
                  onClick={() => pin.length < 4 && setPin(p => p + n)}
                >
                  {n}
                </button>
              ))}
              <div />
              <button 
                className="w-16 h-16 rounded-full bg-slate-50 text-slate-900 text-xl font-black hover:bg-slate-100 transition-colors"
                onClick={() => pin.length < 4 && setPin(p => p + '0')}
              >
                0
              </button>
              <button 
                className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 text-sm font-black hover:bg-slate-100 transition-colors flex items-center justify-center"
                onClick={() => setPin(p => p.slice(0, -1))}
              >
                DEL
              </button>
            </div>

            <Button 
              className="mt-auto py-4" 
              disabled={pin.length < 4}
              onClick={() => setStep('security')}
            >
              Confirm PIN
            </Button>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-6"
          >
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-50 animate-bounce transition-all">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black">All Set!</h2>
              <p className="text-slate-500 font-medium">Your wallet is ready. Let's start managing your wealth.</p>
            </div>
            <Button className="w-full py-4 mt-8" onClick={onComplete}>
              Go to Dashboard
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({ defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button 
      onClick={() => setChecked(!checked)}
      className={cn(
        "w-12 h-6 rounded-full p-1 transition-colors relative",
        checked ? "bg-primary-600" : "bg-slate-200"
      )}
    >
      <motion.div 
        animate={{ x: checked ? 24 : 0 }}
        className="w-4 h-4 bg-white rounded-full shadow-md"
      />
    </button>
  );
}
