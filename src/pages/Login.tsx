import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LogIn, Mail, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { db, addLog, enforceStudentAttendanceBlock } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';
import { getPasswordStrength, hashVerificationCode, verifyPassword, checkRateLimit, needsPasswordUpgrade, resetRateLimit, hashPassword } from '../utils/security';

type RecoveryStep = 'email' | 'otp' | 'password';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginPasswordStatus, setLoginPasswordStatus] = useState<'idle' | 'checking' | 'invalid'>('idle');
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('email');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpHash, setOtpHash] = useState('');
  const [otpChallenge, setOtpChallenge] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpScreenHidden, setOtpScreenHidden] = useState(false);
  const [otpSecondsVisible, setOtpSecondsVisible] = useState(10);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const passwordStrength = getPasswordStrength(newPassword);

  useEffect(() => {
    if (recoveryStep !== 'otp' || !generatedOtp) return;
    setOtpVisible(true);
    setOtpSecondsVisible(10);
    const countdown = window.setInterval(() => {
      setOtpSecondsVisible(seconds => {
        if (seconds <= 1) {
          window.clearInterval(countdown);
          setOtpVisible(false);
          setGeneratedOtp('');
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(countdown);
  }, [recoveryStep, generatedOtp]);

  useEffect(() => {
    if (recoveryStep !== 'otp') return;
    const hideForPrivacy = () => {
      setOtpVisible(false);
      setOtpScreenHidden(true);
      setGeneratedOtp('');
    };
    const handleVisibilityChange = () => {
      if (document.hidden) hideForPrivacy();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', hideForPrivacy);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', hideForPrivacy);
    };
  }, [recoveryStep]);

  const openRecovery = () => {
    setRecoveryOpen(true);
    setRecoveryStep('email');
    setRecoveryEmail(email.trim().toLowerCase());
    setOtp('');
    setGeneratedOtp('');
    setOtpHash('');
    setOtpChallenge('');
    setOtpVisible(false);
    setOtpScreenHidden(false);
    setOtpSecondsVisible(10);
    setNewPassword('');
    setConfirmNewPassword('');
    setRecoveryError('');
    setRecoveryMessage('');
  };

  const closeRecovery = () => {
    setRecoveryOpen(false);
    setRecoveryError('');
    setRecoveryMessage('');
  };

  const handleRecoveryEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    const normalizedEmail = recoveryEmail.trim().toLowerCase();
    const user = db.users.getAll().find(item => item.email.toLowerCase() === normalizedEmail);
    if (!user) { setRecoveryError('No account was found with this email address.'); return; }
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    const newOtp = String(randomBytes[0] % 1000000).padStart(6, '0');
    const challengeBytes = new Uint8Array(18);
    crypto.getRandomValues(challengeBytes);
    const challenge = Array.from(challengeBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    setRecoveryEmail(normalizedEmail);
    setGeneratedOtp(newOtp);
    setOtpChallenge(challenge);
    setOtpHash(hashVerificationCode(newOtp, challenge));
    setOtpVisible(true);
    setOtpScreenHidden(false);
    setOtpSecondsVisible(10);
    setOtpExpiresAt(Date.now() + 5 * 60 * 1000);
    setOtpAttempts(0);
    setRecoveryMessage('Your verification code is ready. It expires in 5 minutes.');
    setRecoveryStep('otp');
  };

  const handleOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    if (Date.now() > otpExpiresAt) { setRecoveryError('This code has expired. Request a new one.'); return; }
    if (otpAttempts >= 5) { setRecoveryError('Too many code attempts. Request a new code.'); return; }
    if (!otpHash || hashVerificationCode(otp.trim(), otpChallenge) !== otpHash) { setOtpAttempts(current => current + 1); setRecoveryError(`Incorrect code. ${4 - otpAttempts} attempts remaining.`); return; }
    setRecoveryMessage('Email verified. Create your new Very Strong password.');
    setRecoveryStep('password');
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    if (passwordStrength.score < 5) { setRecoveryError('Use a Very Strong password with 8+ characters, uppercase, lowercase, number, and symbol.'); return; }
    if (newPassword !== confirmNewPassword) { setRecoveryError('Passwords do not match.'); return; }
    const user = db.users.getAll().find(item => item.email === recoveryEmail);
    if (!user) { setRecoveryError('Account not found. Start recovery again.'); return; }
    db.users.update(user.id, currentUser => ({ ...currentUser, password_hash: hashPassword(newPassword) }));
    addLog('Password Reset', `Password reset completed for ${user.email}`, user.id, `${user.first_name} ${user.last_name}`);
    setRecoveryMessage('Password updated successfully. You can now sign in securely.');
    setRecoveryStep('email');
    setRecoveryOpen(false);
    setPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginPasswordStatus('checking');

    const normalizedEmail = email.trim().toLowerCase();
    const rate = checkRateLimit(normalizedEmail);
    if (!rate.allowed) {
      setError(`Too many attempts. Wait ${rate.waitSeconds} seconds.`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      let user = db.users.getAll().find(u => u.email.toLowerCase() === normalizedEmail);
      if (user?.role === 'student') {
        const student = db.students.getAll().find(item => item.user_id === user?.id);
        if (student) enforceStudentAttendanceBlock(student.id);
        user = db.users.getById(user.id);
      }
      if (user?.account_status === 'blocked') {
        const blockedStudent = user.role === 'student' ? db.students.getAll().find(student => student.user_id === user.id) : null;
        setError(blockedStudent?.second_chance_used ? '🚫 PERMANENTLY BANNED — You wasted your second chance. Repeated absences after admin unblocking resulted in a permanent ban. Contact the school office.' : '⚠️ ACCOUNT BLOCKED — Excessive consecutive absences detected. You may request ONE second chance from the administrator. Use it wisely.');
        setLoading(false);
        return;
      }
      if (!user || !verifyPassword(password, user.password_hash)) {
        setError('Invalid email or password.');
          setLoginPasswordStatus('invalid');
        setLoading(false);
        return;
      }

      if (needsPasswordUpgrade(user.password_hash)) {
        db.users.update(user.id, currentUser => ({ ...currentUser, password_hash: hashPassword(password) }));
      }
      resetRateLimit(normalizedEmail);
      login(user);
      addLog('Login', `User logged in: ${user.email}`, user.id, `${user.first_name} ${user.last_name}`);

      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    }, 400);
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="alert alert-danger"><AlertTriangle size={16} style={{marginRight:6,verticalAlign:'middle'}}/>{error}</div>}
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@school.edu" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <div className="password-input-wrap"><input className={loginPasswordStatus === 'invalid' ? 'password-input-invalid' : ''} type={showLoginPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setLoginPasswordStatus('idle'); setError(''); }} placeholder="••••••••" required /><button type="button" className="password-eye-button" onClick={() => setShowLoginPassword(value => !value)} aria-label={showLoginPassword ? 'Hide password' : 'Show password'}>{showLoginPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
          <div className={`password-login-indicator ${loginPasswordStatus}`}><span />{loginPasswordStatus === 'checking' ? 'Checking password securely...' : loginPasswordStatus === 'invalid' ? 'Incorrect password' : password ? 'Password entered. Submit to verify.' : 'Enter your password.'}</div>
        </div>
        <button type="submit" className="btn btn-primary" style={{width:'100%'}} disabled={loading}>
          <LogIn size={16} /> {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <div className="auth-footer">
          <button type="button" className="forgot-password-link" onClick={openRecovery}><KeyRound size={14} /> Forgot password?</button>
          <p>Don&apos;t have an account? <Link to="/register">Register</Link></p>
          <p style={{marginTop:8,fontSize:'0.75rem',opacity:0.7}}>Default: admin@school.edu / admin123</p>
        </div>
      </form>
      {recoveryOpen && (
        <div className="recovery-overlay" role="dialog" aria-modal="true" aria-labelledby="recovery-title">
          <div className="recovery-card">
            <button type="button" className="recovery-close" onClick={closeRecovery} aria-label="Close password recovery"><ArrowLeft size={18} /></button>
            <div className="recovery-orb"><ShieldCheck size={25} /></div>
            <span className="recovery-kicker">Account recovery</span>
            <h2 id="recovery-title">Reset your password</h2>
            <p className="recovery-intro">Verify your email, confirm the one-time code, then create a stronger password.</p>
            <div className="recovery-steps"><span className={recoveryStep === 'email' ? 'active' : 'done'}><Mail size={14} /> Email</span><i /><span className={recoveryStep === 'otp' ? 'active' : recoveryStep === 'password' ? 'done' : ''}><ShieldCheck size={14} /> OTP</span><i /><span className={recoveryStep === 'password' ? 'active' : ''}><KeyRound size={14} /> Password</span></div>
            {recoveryError && <div className="alert alert-danger recovery-alert"><AlertTriangle size={16} />{recoveryError}</div>}
            {recoveryMessage && <div className="recovery-message"><CheckCircle2 size={16} />{recoveryMessage}</div>}
            {recoveryStep === 'email' && <form onSubmit={handleRecoveryEmail} className="recovery-form"><label>Email address<input type="email" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} placeholder="you@example.com" required autoFocus /></label><button className="btn btn-primary" type="submit"><Mail size={16} /> Send verification code</button></form>}
            {recoveryStep === 'otp' && <form onSubmit={handleOtp} className="recovery-form"><div className={`otp-code-display ${!otpVisible ? 'is-hidden' : ''}`}>{otpVisible ? <><Sparkles size={16} /><span>Verification code</span><strong>{generatedOtp}</strong><small>Code display closes in {otpSecondsVisible}s</small></> : <><ShieldCheck size={20} /><span>Code hidden for your security</span><small>{otpScreenHidden ? 'Screen privacy activated. Use the OTP sent to your email.' : 'Use the OTP sent to your email.'}</small></>}</div><label>Enter 6-digit code<input className="otp-input" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required autoFocus /></label><button className="btn btn-primary" type="submit"><ShieldCheck size={16} /> Verify code</button><button type="button" className="recovery-secondary" onClick={() => setRecoveryStep('email')}>Use another email</button></form>}
            {recoveryStep === 'password' && <form onSubmit={handlePasswordReset} className="recovery-form"><label>New password<div className="password-input-wrap"><input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Create a Very Strong password" required autoFocus /><button type="button" className="password-eye-button" onClick={() => setShowNewPassword(value => !value)} aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}>{showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label><div className="recovery-strength"><span style={{ width: `${(passwordStrength.score / 5) * 100}%`, background: passwordStrength.color }} /><strong style={{ color: passwordStrength.color }}>{passwordStrength.label}</strong></div><small className="recovery-password-hint">Use 8+ characters with uppercase, lowercase, number, and symbol.</small><label>Confirm new password<div className="password-input-wrap"><input className={confirmNewPassword && newPassword !== confirmNewPassword ? 'password-input-invalid' : ''} type={showConfirmNewPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required /><button type="button" className="password-eye-button" onClick={() => setShowConfirmNewPassword(value => !value)} aria-label={showConfirmNewPassword ? 'Hide confirmation password' : 'Show confirmation password'}>{showConfirmNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{confirmNewPassword && <div className={`password-match-indicator ${newPassword === confirmNewPassword ? 'matched' : 'mismatched'}`}><span />{newPassword === confirmNewPassword ? 'Passwords match' : 'Passwords do not match'}</div>}<button className="btn btn-primary" type="submit"><KeyRound size={16} /> Update password</button></form>}
          </div>
        </div>
      )}
    </AuthLayout>
  );
}