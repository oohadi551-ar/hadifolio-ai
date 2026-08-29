import React, { useState } from 'react';
import { AppLogo } from './AppLogo';
import { Lock, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';

interface PinLockModalProps {
  onSuccess: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CORRECT_PIN = '6886';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;

    if (pin.trim() === CORRECT_PIN) {
      setIsSubmitting(true);
      sessionStorage.setItem('hadifolio_authenticated', 'true');
      setTimeout(() => {
        onSuccess();
      }, 250);
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      if (newPin.length === 4) {
        if (newPin === CORRECT_PIN) {
          setIsSubmitting(true);
          sessionStorage.setItem('hadifolio_authenticated', 'true');
          setTimeout(() => {
            onSuccess();
          }, 250);
        } else {
          setError(true);
          setTimeout(() => setPin(''), 450);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md font-['Cairo',sans-serif] overflow-y-auto">
      <div className="w-full max-w-[340px] sm:max-w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-5 sm:p-7 text-center relative overflow-hidden my-auto">
        
        {/* Top Decorative background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#6E7141]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#8A5A2E]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Logo and branding */}
        <div className="flex flex-col items-center mb-4 relative">
          <div className="p-2 sm:p-2.5 bg-slate-50 rounded-2xl border border-slate-200/90 shadow-xs mb-2.5">
            <AppLogo size={56} />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            هادي المساعد الشخصي
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            أدخل رمز المرور السري للدخول إلى المنصة
          </p>
        </div>

        {/* Pin Dots */}
        <div className="flex justify-center items-center gap-2.5 sm:gap-3 my-4 sm:my-5">
          {[0, 1, 2, 3].map((idx) => {
            const filled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-rose-500 scale-110 animate-bounce'
                    : filled
                    ? 'bg-[#6E7141] scale-110 ring-4 ring-[#6E7141]/20'
                    : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-bold mb-3.5 bg-rose-50 py-1.5 px-3 rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            رمز المرور غير صحيح، يرجى المحاولة ثانية
          </div>
        )}

        {/* Numeric keypad */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[260px] mx-auto mb-4 sm:mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              disabled={isSubmitting}
              className="h-11 sm:h-12 rounded-2xl bg-slate-100/90 hover:bg-slate-200 active:bg-[#6E7141]/20 text-base sm:text-lg font-bold text-slate-800 transition-all flex items-center justify-center shadow-2xs select-none active:scale-95 disabled:opacity-50"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="h-11 sm:h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-500 transition-all flex items-center justify-center"
          >
            مسح
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            disabled={isSubmitting}
            className="h-11 sm:h-12 rounded-2xl bg-slate-100/90 hover:bg-slate-200 active:bg-[#6E7141]/20 text-base sm:text-lg font-bold text-slate-800 transition-all flex items-center justify-center shadow-2xs select-none active:scale-95 disabled:opacity-50"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-11 sm:h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-all flex items-center justify-center"
            title="حذف رقم"
          >
            ←
          </button>
        </div>

        {/* Direct text form input option for desktop/keyboard users */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              setError(false);
            }}
            placeholder="أو اكتب الرقم هنا..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs sm:text-sm font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6E7141]/40 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={pin.length !== 4 || isSubmitting}
            className="px-4 py-2 bg-[#6E7141] hover:bg-[#454726] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0"
          >
            <KeyRound className="w-3.5 h-3.5" />
            دخول
          </button>
        </form>

        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-3.5">
          نظام محمي ومشفر لمراجعة المقررات الدراسية
        </p>

      </div>
    </div>
  );
};
