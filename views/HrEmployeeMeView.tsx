import React, { useEffect, useState, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import { HrMeProfile, HrMonthlyReport } from '../types';
import { hrMeService, hrPinService, hrWebAuthnService, hrAttendanceService, hrReportsService } from '../services/hrApiServices';
import { useLanguage } from '../context/LanguageContext';

// ───────── helpers ─────────
function fmtMinutes(mins: number) {
  if (!mins) return '0';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtTime(ts: string | null) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const DAY_LABELS_EN = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS_AR = ['', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت', 'أحد'];

// ───────── component ─────────
const HrEmployeeMeView: React.FC = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [profile, setProfile] = useState<HrMeProfile | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<HrMonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const coordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const curMonth = new Date().toISOString().slice(0, 7);

  // PIN state
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);
  // Auth mode: 'bio' or 'pin'
  const [authMode, setAuthMode] = useState<'bio' | 'pin'>('bio');

  // ── load profile + monthly report ──
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [p, r] = await Promise.all([
        hrMeService.getProfile(),
        hrReportsService.myMonthly(curMonth).catch(() => null),
      ]);
      setProfile(p);
      setMonthlyReport(r);
      // Default auth mode based on what's available
      if (p?.bioRegistered) setAuthMode('bio');
      else if (p?.pinSet) setAuthMode('pin');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [curMonth]);

  useEffect(() => { refresh(); }, [refresh]);

  // ── GPS helper ──
  const getGps = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error(isAr ? 'GPS غير مدعوم' : 'GPS not supported'));
      setGpsStatus('loading');
      navigator.geolocation.getCurrentPosition(
        pos => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          coordsRef.current = c;
          setGpsStatus('ok');
          resolve(c);
        },
        err => {
          setGpsStatus('err');
          reject(new Error(isAr ? 'فشل تحديد الموقع. يرجى تفعيل GPS' : 'Location unavailable. Enable GPS.'));
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });
  };

  // ── WebAuthn Registration ──
  const handleRegisterBiometric = async () => {
    setActionLoading(true);
    setMsg(null);
    try {
      const { startRegistration } = await import('@simplewebauthn/browser');
      const options = await hrWebAuthnService.getRegisterOptions();
      const attResp = await startRegistration(options);
      const result = await hrWebAuthnService.verifyRegistration(attResp);
      if (result.verified) {
        setMsg({ text: isAr ? 'تم تسجيل البصمة بنجاح ✓' : 'Biometric registered successfully ✓', type: 'ok' });
        refresh();
      } else {
        setMsg({ text: isAr ? 'فشل التحقق من البصمة' : 'Biometric verification failed', type: 'err' });
      }
    } catch (e: any) {
      console.error('Bio register error:', e);
      const message = e?.name === 'NotAllowedError'
        ? (isAr ? 'تم إلغاء عملية البصمة' : 'Biometric operation cancelled')
        : (e?.message || (isAr ? 'خطأ في تسجيل البصمة' : 'Biometric registration error'));
      setMsg({ text: message, type: 'err' });
    } finally {
      setActionLoading(false);
    }
  };

  // ── WebAuthn Authentication (returns true/false) ──
  const authenticateBio = async (): Promise<boolean> => {
    try {
      const { startAuthentication } = await import('@simplewebauthn/browser');
      const options = await hrWebAuthnService.getAuthenticateOptions();
      const assertion = await startAuthentication(options);
      const result = await hrWebAuthnService.verifyAuthentication(assertion);
      return result.verified;
    } catch (e: any) {
      console.error('Bio auth failed:', e);
      if (e?.name === 'NotAllowedError') {
        setMsg({ text: isAr ? 'تم إلغاء عملية البصمة' : 'Biometric cancelled by user', type: 'err' });
      }
      return false;
    }
  };

  // ── Set PIN ──
  const handleSetPin = async () => {
    if (!newPin || newPin.length < 4) {
      setMsg({ text: isAr ? 'الرمز يجب أن يكون 4 أرقام على الأقل' : 'PIN must be at least 4 digits', type: 'err' });
      return;
    }
    if (newPin !== confirmPin) {
      setMsg({ text: isAr ? 'الرمز غير متطابق' : 'PINs do not match', type: 'err' });
      return;
    }
    setActionLoading(true);
    setMsg(null);
    try {
      await hrPinService.setPin(newPin);
      setMsg({ text: isAr ? 'تم حفظ رمز PIN بنجاح ✓' : 'PIN set successfully ✓', type: 'ok' });
      setNewPin('');
      setConfirmPin('');
      setShowPinSetup(false);
      refresh();
    } catch (e: any) {
      setMsg({ text: e?.message || (isAr ? 'خطأ في حفظ الرمز' : 'Failed to set PIN'), type: 'err' });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Check In ──
  const handleCheckIn = async () => {
    if (authMode === 'pin' && (!pin || pin.length < 4)) {
      setMsg({ text: isAr ? 'أدخل رمز PIN أولاً' : 'Enter your PIN first', type: 'err' });
      return;
    }
    setActionLoading(true);
    setMsg(null);
    try {
      // 1) GPS
      const coords = await getGps();

      // 2) Biometric or PIN
      let bio_verified = false;
      if (authMode === 'bio') {
        const ok = await authenticateBio();
        if (!ok) {
          setMsg({ text: isAr ? 'فشل التحقق من البصمة' : 'Biometric verification failed', type: 'err' });
          setActionLoading(false);
          return;
        }
        bio_verified = true;
      }

      // 3) Send check-in
      const result = await hrAttendanceService.checkIn({
        latitude: coords.lat,
        longitude: coords.lng,
        ...(bio_verified ? { bio_verified: true } : { pin }),
        device_info: navigator.userAgent.slice(0, 120),
      });
      setMsg({ text: `${result.message} — ${result.clinicName}`, type: 'ok' });
      setPin('');
      refresh();
    } catch (e: any) {
      setMsg({ text: e?.message || (isAr ? 'خطأ في تسجيل الحضور' : 'Check-in error'), type: 'err' });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Check Out ──
  const handleCheckOut = async () => {
    if (authMode === 'pin' && (!pin || pin.length < 4)) {
      setMsg({ text: isAr ? 'أدخل رمز PIN أولاً' : 'Enter your PIN first', type: 'err' });
      return;
    }
    setActionLoading(true);
    setMsg(null);
    try {
      const coords = await getGps();

      let bio_verified = false;
      if (authMode === 'bio') {
        const ok = await authenticateBio();
        if (!ok) {
          setMsg({ text: isAr ? 'فشل التحقق من البصمة' : 'Biometric verification failed', type: 'err' });
          setActionLoading(false);
          return;
        }
        bio_verified = true;
      }

      const result = await hrAttendanceService.checkOut({
        latitude: coords.lat,
        longitude: coords.lng,
        ...(bio_verified ? { bio_verified: true } : { pin }),
        device_info: navigator.userAgent.slice(0, 120),
      });
      setMsg({
        text: `${result.message} — ${fmtMinutes(result.totalMinutes)} ${isAr ? 'عمل' : 'worked'}`,
        type: 'ok',
      });
      setPin('');
      refresh();
    } catch (e: any) {
      setMsg({ text: e?.message || (isAr ? 'خطأ في تسجيل المغادرة' : 'Check-out error'), type: 'err' });
    } finally {
      setActionLoading(false);
    }
  };

  // ── derived state ──
  const today = profile?.todayAttendance;
  const checkedIn = !!today?.checkIn;
  const checkedOut = !!today?.checkOut;
  const sched = profile?.schedule;
  const summary = monthlyReport?.summary;
  const hasAnyAuth = profile?.bioRegistered || profile?.pinSet;

  if (loading) {
    return (
      <Layout title={isAr ? 'بوابة الموظف' : 'Employee Portal'}>
        <div className="p-12 text-center text-slate-400"><i className="fa-solid fa-circle-notch fa-spin text-3xl"></i></div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout title={isAr ? 'بوابة الموظف' : 'Employee Portal'}>
        <div className="p-12 text-center text-red-400 font-bold">{isAr ? 'فشل تحميل الملف الشخصي' : 'Failed to load profile'}</div>
      </Layout>
    );
  }

  return (
    <Layout title={isAr ? 'بوابة الموظف' : 'Employee Portal'}>
      {/* Alert Banner */}
      {msg && (
        <div className={`mb-4 p-4 rounded-2xl font-bold text-sm flex items-center gap-2 ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          <i className={`fa-solid ${msg.type === 'ok' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
          {msg.text}
          <button className="ms-auto opacity-60 hover:opacity-100" onClick={() => setMsg(null)}><i className="fa-solid fa-xmark"></i></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile + Schedule Card */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-200">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-extrabold text-slate-800">{profile.fullName}</h2>
                <p className="text-sm text-slate-400 font-medium">@{profile.username}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${profile.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                {profile.status === 'active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
              </div>
            </div>

            {sched && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <h4 className="text-xs uppercase font-bold text-slate-400 mb-3">{isAr ? 'جدول العمل' : 'Work Schedule'}</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[1, 2, 3, 4, 5, 6, 7].map(d => (
                    <span key={d} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${sched.workDays.includes(d) ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-300'}`}>
                      {isAr ? DAY_LABELS_AR[d] : DAY_LABELS_EN[d]}
                    </span>
                  ))}
                </div>
                <div className="flex gap-6 text-sm">
                  <span className="text-slate-500"><i className="fa-solid fa-clock text-indigo-400 me-1"></i> {sched.startTime} — {sched.endTime}</span>
                  <span className="text-slate-500"><i className="fa-solid fa-hourglass-half text-amber-400 me-1"></i> {sched.graceMinutes}m {isAr ? 'مهلة' : 'grace'}</span>
                  {sched.overtimeEnabled && <span className="text-indigo-600 font-bold"><i className="fa-solid fa-bolt me-1"></i> OT</span>}
                </div>
              </div>
            )}
          </div>

          {/* ── BIOMETRIC SECTION ── */}
          {!profile.bioRegistered && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-dashed border-indigo-300 p-6 text-center">
              <i className="fa-solid fa-fingerprint text-5xl text-indigo-500 mb-3"></i>
              <h3 className="text-lg font-extrabold text-indigo-800 mb-1">
                {isAr ? 'سجّل بصمتك الآن' : 'Register Biometric'}
              </h3>
              <p className="text-sm text-indigo-600 mb-4">
                {isAr ? 'استخدم البصمة أو Face ID لتسجيل الحضور بسرعة' : 'Use fingerprint or Face ID for fast attendance'}
              </p>
              <button
                onClick={handleRegisterBiometric}
                disabled={actionLoading}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-2xl font-extrabold text-sm transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {actionLoading ? <i className="fa-solid fa-circle-notch fa-spin me-2"></i> : <i className="fa-solid fa-fingerprint me-2"></i>}
                {isAr ? 'تسجيل البصمة' : 'Register Biometric'}
              </button>
            </div>
          )}

          {profile.bioRegistered && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <i className="fa-solid fa-fingerprint text-emerald-600 text-xl"></i>
              </div>
              <div className="flex-1">
                <p className="font-bold text-emerald-700">{isAr ? 'البصمة مسجلة' : 'Biometric Registered'}</p>
                <p className="text-xs text-emerald-500">{profile.bioCount} {isAr ? 'أجهزة مسجلة' : 'device(s) registered'}</p>
              </div>
              <button
                onClick={handleRegisterBiometric}
                disabled={actionLoading}
                className="text-sm text-emerald-600 hover:text-emerald-800 font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors"
              >
                <i className="fa-solid fa-plus me-1"></i> {isAr ? 'إضافة جهاز' : 'Add Device'}
              </button>
            </div>
          )}

          {/* ── PIN SECTION ── */}
          {!profile.pinSet && !showPinSetup && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-amber-300 p-5 text-center">
              <i className="fa-solid fa-lock text-4xl text-amber-500 mb-2"></i>
              <h3 className="text-base font-extrabold text-amber-800 mb-1">
                {isAr ? 'أنشئ رمز PIN احتياطي' : 'Set Backup PIN'}
              </h3>
              <p className="text-xs text-amber-600 mb-3">
                {isAr ? 'استخدم PIN كبديل عن البصمة' : 'Use PIN as an alternative to biometric'}
              </p>
              <button
                onClick={() => setShowPinSetup(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-2xl font-extrabold text-sm transition-colors shadow-lg shadow-amber-200"
              >
                <i className="fa-solid fa-key me-2"></i>
                {isAr ? 'إنشاء رمز PIN' : 'Create PIN'}
              </button>
            </div>
          )}

          {showPinSetup && (
            <div className="bg-white rounded-2xl shadow-soft border border-indigo-200 p-6">
              <h3 className="font-extrabold text-slate-700 mb-4">
                <i className="fa-solid fa-key text-indigo-500 me-2"></i>
                {isAr ? (profile.pinSet ? 'تغيير رمز PIN' : 'إنشاء رمز PIN') : (profile.pinSet ? 'Change PIN' : 'Create PIN Code')}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">{isAr ? 'رمز PIN (4-6 أرقام)' : 'PIN (4-6 digits)'}</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • •"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">{isAr ? 'تأكيد الرمز' : 'Confirm PIN'}</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • •"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSetPin}
                    disabled={actionLoading}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-extrabold text-sm transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? <i className="fa-solid fa-circle-notch fa-spin me-2"></i> : <i className="fa-solid fa-check me-2"></i>}
                    {isAr ? 'حفظ' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setShowPinSetup(false); setNewPin(''); setConfirmPin(''); }}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-sm transition-colors"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {profile.pinSet && !showPinSetup && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <i className="fa-solid fa-lock text-amber-600 text-xl"></i>
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-700">{isAr ? 'رمز PIN مفعّل' : 'PIN Code Active'}</p>
                <p className="text-xs text-amber-500">{isAr ? 'بديل عن البصمة' : 'Alternative to biometric'}</p>
              </div>
              <button
                onClick={() => setShowPinSetup(true)}
                className="text-sm text-amber-600 hover:text-amber-800 font-bold px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-colors"
              >
                <i className="fa-solid fa-pen me-1"></i> {isAr ? 'تغيير' : 'Change'}
              </button>
            </div>
          )}

          {/* ── ATTENDANCE CHECK-IN / CHECK-OUT ── */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-extrabold text-slate-700 uppercase text-sm">{isAr ? 'الحضور والانصراف' : 'Attendance'}</h3>
              {gpsStatus === 'loading' && <span className="text-xs text-amber-500"><i className="fa-solid fa-circle-notch fa-spin"></i> GPS</span>}
              {gpsStatus === 'ok' && <span className="text-xs text-emerald-500"><i className="fa-solid fa-location-dot"></i> GPS OK</span>}
              {gpsStatus === 'err' && <span className="text-xs text-red-500"><i className="fa-solid fa-location-crosshairs"></i> GPS Error</span>}
            </div>

            {/* Auth Mode Toggle — show only if BOTH bio and pin are available */}
            {profile.bioRegistered && profile.pinSet && !checkedOut && (
              <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
                <button
                  onClick={() => { setAuthMode('bio'); setPin(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${authMode === 'bio' ? 'bg-white shadow text-indigo-700' : 'text-slate-400'}`}
                >
                  <i className="fa-solid fa-fingerprint me-1.5"></i> {isAr ? 'بصمة' : 'Biometric'}
                </button>
                <button
                  onClick={() => setAuthMode('pin')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${authMode === 'pin' ? 'bg-white shadow text-amber-700' : 'text-slate-400'}`}
                >
                  <i className="fa-solid fa-lock me-1.5"></i> PIN
                </button>
              </div>
            )}

            {/* PIN Input — only show if pin mode */}
            {authMode === 'pin' && profile.pinSet && !checkedOut && (
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">
                  <i className="fa-solid fa-lock me-1"></i> {isAr ? 'رمز PIN' : 'Enter PIN'}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>
            )}

            {/* Biometric info label when bio mode */}
            {authMode === 'bio' && profile.bioRegistered && !checkedOut && (
              <div className="mb-4 p-3 bg-indigo-50 rounded-xl text-center">
                <p className="text-sm text-indigo-600 font-bold">
                  <i className="fa-solid fa-fingerprint me-1"></i>
                  {isAr ? 'سيُطلب منك البصمة عند الضغط' : 'Biometric will be prompted on tap'}
                </p>
              </div>
            )}

            {/* No auth setup warning */}
            {!hasAnyAuth && (
              <div className="mb-4 p-4 bg-red-50 rounded-xl text-center border border-red-200">
                <p className="text-sm text-red-600 font-bold">
                  <i className="fa-solid fa-triangle-exclamation me-1"></i>
                  {isAr ? 'سجّل البصمة أو أنشئ رمز PIN أولاً' : 'Register biometric or set PIN first'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Check In */}
              <button
                onClick={handleCheckIn}
                disabled={actionLoading || checkedIn || !hasAnyAuth}
                className={`p-6 rounded-2xl font-extrabold text-lg transition-all flex flex-col items-center gap-2 ${
                  checkedIn || !hasAnyAuth
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-200 active:scale-95'
                }`}
              >
                {actionLoading ? (
                  <i className="fa-solid fa-circle-notch fa-spin text-3xl"></i>
                ) : (
                  <i className={`fa-solid fa-right-to-bracket text-3xl ${checkedIn || !hasAnyAuth ? '' : 'animate-pulse'}`}></i>
                )}
                {checkedIn ? (
                  <span className="text-sm">{isAr ? 'تم الدخول' : 'Checked In'} ✓</span>
                ) : (
                  <span>{isAr ? 'تسجيل دخول' : 'Check In'}</span>
                )}
                {checkedIn && today?.checkIn && (
                  <span className="text-xs font-medium">{fmtTime(today.checkIn)}</span>
                )}
              </button>

              {/* Check Out */}
              <button
                onClick={handleCheckOut}
                disabled={actionLoading || !checkedIn || checkedOut}
                className={`p-6 rounded-2xl font-extrabold text-lg transition-all flex flex-col items-center gap-2 ${
                  !checkedIn || checkedOut
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-200 active:scale-95'
                }`}
              >
                {actionLoading ? (
                  <i className="fa-solid fa-circle-notch fa-spin text-3xl"></i>
                ) : (
                  <i className="fa-solid fa-right-from-bracket text-3xl"></i>
                )}
                {checkedOut ? (
                  <span className="text-sm">{isAr ? 'تم الخروج' : 'Checked Out'} ✓</span>
                ) : (
                  <span>{isAr ? 'تسجيل خروج' : 'Check Out'}</span>
                )}
                {checkedOut && today?.checkOut && (
                  <span className="text-xs font-medium">{fmtTime(today.checkOut)}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6">
          {/* Today's Status */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-5">
            <h3 className="font-extrabold text-sm text-slate-500 uppercase mb-4">
              <i className="fa-solid fa-calendar-day me-1 text-indigo-400"></i>
              {isAr ? 'حالة اليوم' : "Today's Status"}
            </h3>
            {today ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{isAr ? 'دخول' : 'In'}</span>
                  <span className="font-bold text-sm font-mono">{fmtTime(today.checkIn)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{isAr ? 'خروج' : 'Out'}</span>
                  <span className="font-bold text-sm font-mono">{fmtTime(today.checkOut)}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{isAr ? 'المجموع' : 'Total'}</span>
                  <span className="font-extrabold text-slate-800">{fmtMinutes(today.totalMinutes)}</span>
                </div>
                {today.lateMinutes > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-amber-500 text-sm">{isAr ? 'تأخير' : 'Late'}</span>
                    <span className="font-bold text-amber-600">{today.lateMinutes}m</span>
                  </div>
                )}
                {today.overtimeMinutes > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-500 text-sm">{isAr ? 'إضافي' : 'Overtime'}</span>
                    <span className="font-bold text-indigo-600">{today.overtimeMinutes}m</span>
                  </div>
                )}
                <div className="pt-2 text-center">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    today.status === 'normal' ? 'bg-emerald-100 text-emerald-700' :
                    today.status === 'late' ? 'bg-amber-100 text-amber-700' :
                    today.status === 'incomplete' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {today.status === 'normal' ? (isAr ? 'منتظم' : 'Normal') :
                     today.status === 'late' ? (isAr ? 'متأخر' : 'Late') :
                     today.status === 'incomplete' ? (isAr ? 'غير مكتمل' : 'Incomplete') :
                     today.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-slate-300">
                <i className="fa-solid fa-ghost text-3xl mb-2 block"></i>
                <p className="text-sm font-bold">{isAr ? 'لم تسجل حضور اليوم' : 'No attendance today'}</p>
              </div>
            )}
          </div>

          {/* Monthly Summary */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-5">
            <h3 className="font-extrabold text-sm text-slate-500 uppercase mb-4">
              <i className="fa-solid fa-chart-pie me-1 text-indigo-400"></i>
              {isAr ? 'ملخص الشهر' : 'Monthly Summary'}
            </h3>
            {summary ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{isAr ? 'أيام حضور' : 'Days Present'}</span>
                  <span className="font-extrabold text-emerald-600">{summary.daysPresent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{isAr ? 'إجمالي العمل' : 'Total Work'}</span>
                  <span className="font-extrabold text-slate-800">{fmtMinutes(summary.totalWorkMinutes)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{isAr ? 'تأخير' : 'Late'}</span>
                  <span className="font-bold text-amber-600">{fmtMinutes(summary.totalLateMinutes)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{isAr ? 'إضافي' : 'Overtime'}</span>
                  <span className="font-bold text-indigo-600">{fmtMinutes(summary.totalOvertimeMinutes)}</span>
                </div>
                {summary.totalAbsences > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{isAr ? 'غياب' : 'Absences'}</span>
                    <span className="font-bold text-red-500">{summary.totalAbsences}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-slate-300 text-sm py-4">{isAr ? 'لا توجد بيانات' : 'No data yet'}</p>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2 text-xs text-slate-500">
            <p><i className="fa-solid fa-location-dot text-emerald-400 me-1"></i> {isAr ? 'يجب تفعيل GPS لتسجيل الحضور' : 'GPS must be enabled for attendance'}</p>
            {profile.bioRegistered && (
              <p><i className="fa-solid fa-fingerprint text-indigo-400 me-1"></i> {isAr ? 'البصمة مسجلة — يمكنك استخدامها للحضور' : 'Biometric registered — use it for attendance'}</p>
            )}
            {profile.pinSet && (
              <p><i className="fa-solid fa-lock text-amber-400 me-1"></i> {isAr ? 'رمز PIN متاح كبديل' : 'PIN available as alternative'}</p>
            )}
            {!profile.bioRegistered && !profile.pinSet && (
              <p><i className="fa-solid fa-triangle-exclamation text-red-400 me-1"></i> {isAr ? 'سجّل البصمة أو أنشئ PIN للبدء' : 'Register biometric or create PIN to start'}</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HrEmployeeMeView;
