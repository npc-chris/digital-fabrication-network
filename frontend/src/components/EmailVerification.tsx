'use client';

import { useState, useRef, useEffect } from 'react';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onCancel?: () => void;
}

export default function EmailVerification({ email, onVerified, onCancel }: EmailVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Send verification code on mount
  useEffect(() => {
    sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendCode = async () => {
    setSending(true);
    setError('');
    try {
      await api.post('/api/email-verification/send-code', { email });
      setCountdown(60); // 60 second cooldown
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send verification code');
    } finally {
      setSending(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take last character
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newCode.every(digit => digit) && newCode.join('').length === 6) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      verifyCode(pastedData);
    }
  };

  const verifyCode = async (codeString: string) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/email-verification/verify-code', { 
        email, 
        code: codeString,
      });
      setSuccess(true);
      setTimeout(() => {
        onVerified();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
        <p className="text-gray-600">Your email has been verified successfully.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We sent a verification code to<br />
          <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>

      {/* Code Input */}
      <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
        {code.map((digit, index) => (
          <input
            key={index}
            ref={el => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={loading}
            className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none disabled:bg-gray-100"
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 mb-4 justify-center">
          <XCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Verifying...</span>
        </div>
      )}

      {/* Resend Code */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Didn&apos;t receive the code?</p>
        {countdown > 0 ? (
          <p className="text-sm text-gray-500">
            Resend code in {countdown} seconds
          </p>
        ) : (
          <button
            onClick={sendCode}
            disabled={sending}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Resend Code'}
          </button>
        )}
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full mt-6 py-2 text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
