"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setError("");
    setShowError(false);
    setLoading(true);

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      throw new Error("Invalid credentials or server error");
    }

    const data = await res.json();

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("ann_name", email.split("@")[0]);

    if (data.role === "student") {
      router.replace("/student");
    } else if (data.role === "mess" || data.role === "mess_incharge") {
      router.replace("/mess");
    } else if (data.role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/login");
    }
  } catch (err) {
    console.error("Login error:", err);
    setError("Failed to fetch or invalid login");
    setShowError(true);
  } finally {
    setLoading(false);
  }
};
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --green-bright: #00ff87;
          --green-mid: #00c96a;
          --green-deep: #00874a;
          --green-glow: rgba(0, 255, 135, 0.15);
          --bg-void: #060a0d;
          --bg-panel: rgba(8, 16, 12, 0.72);
          --border-glass: rgba(0, 255, 135, 0.12);
          --text-primary: #e8f5ee;
          --text-muted: #5a7a65;
          --text-dim: #8aab96;
        }

        body {
          background: var(--bg-void);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          overflow: hidden;
        }

        .page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 1.5rem;
        }

        /* Animated mesh background */
        .bg-mesh {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }

        .mesh-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: drift 18s ease-in-out infinite alternate;
          will-change: transform;
        }

        .orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(0,200,100,0.22) 0%, transparent 70%);
          top: -15%; left: -10%;
          animation-duration: 22s;
        }
        .orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(0,255,135,0.10) 0%, transparent 70%);
          bottom: -10%; right: -5%;
          animation-duration: 18s;
          animation-delay: -7s;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(0,140,80,0.18) 0%, transparent 70%);
          top: 40%; left: 55%;
          animation-duration: 14s;
          animation-delay: -3s;
        }

        @keyframes drift {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(40px, -30px) scale(1.08); }
          66%  { transform: translate(-20px, 50px) scale(0.95); }
          100% { transform: translate(30px, 20px) scale(1.04); }
        }

        /* Grid overlay */
        .bg-grid {
          position: fixed;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(rgba(0,255,135,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,135,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        /* Corner scan line */
        .scan-line {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0,255,135,0.03) 50%,
            transparent 100%
          );
          background-size: 100% 200px;
          animation: scan 8s linear infinite;
          pointer-events: none;
        }

        @keyframes scan {
          0%   { background-position: 0 -200px; }
          100% { background-position: 0 100vh; }
        }

        /* === CARD === */
        .card-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          opacity: 0;
          transform: translateY(24px);
          animation: revealCard 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
        }

        @keyframes revealCard {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Glow ring behind card */
        .card-glow {
          position: absolute;
          inset: -2px;
          border-radius: 20px;
          background: conic-gradient(
            from 210deg,
            transparent 40%,
            rgba(0,255,135,0.4) 50%,
            transparent 60%,
            transparent 100%
          );
          animation: rotateConic 6s linear infinite;
          z-index: -1;
          filter: blur(6px);
        }

        @keyframes rotateConic {
          to { transform: rotate(360deg); }
        }

        .card-glow-inner {
          position: absolute;
          inset: 1px;
          border-radius: 19px;
          background: var(--bg-void);
          z-index: -1;
        }

        .login-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-glass);
          border-radius: 20px;
          padding: 2.75rem 2.5rem 2.5rem;
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          box-shadow:
            0 0 0 1px rgba(0,255,135,0.06),
            0 32px 80px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.04);
          position: relative;
          overflow: hidden;
        }

        .card-shimmer {
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(0,255,135,0.04) 50%,
            transparent 60%
          );
          animation: shimmerPass 5s ease-in-out 1s infinite;
          pointer-events: none;
        }

        @keyframes shimmerPass {
          0%   { left: -100%; }
          40%  { left: 140%; }
          100% { left: 140%; }
        }

        /* === LOGO === */
        .logo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.25rem;
          opacity: 0;
          animation: fadeUp 0.6s ease 0.4s forwards;
        }

        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
          from { opacity: 0; transform: translateY(10px); }
        }

        .logo-icon-wrap {
          position: relative;
          width: 72px; height: 72px;
          display: flex; align-items: center; justify-content: center;
        }

        .logo-icon-bg {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(0,255,135,0.12), rgba(0,140,80,0.06));
          border: 1px solid rgba(0,255,135,0.2);
          box-shadow: 0 0 30px rgba(0,255,135,0.1), inset 0 0 20px rgba(0,255,135,0.05);
        }

        .logo-pulse {
          position: absolute;
          inset: -8px;
          border-radius: 26px;
          border: 1px solid rgba(0,255,135,0.15);
          animation: pulseRing 2.5s ease-in-out infinite;
        }

        .logo-pulse-2 {
          position: absolute;
          inset: -16px;
          border-radius: 32px;
          border: 1px solid rgba(0,255,135,0.07);
          animation: pulseRing 2.5s ease-in-out 0.8s infinite;
        }

        @keyframes pulseRing {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.04); }
        }

        .logo-svg {
          position: relative;
          z-index: 1;
          width: 36px; height: 36px;
        }

        .logo-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.65rem;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          text-align: center;
          line-height: 1.15;
        }

        .logo-title span {
          background: linear-gradient(135deg, var(--green-bright), var(--green-mid));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-tagline {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          font-weight: 300;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-align: center;
          margin-top: -0.35rem;
          opacity: 0;
          animation: fadeUp 0.6s ease 0.6s forwards;
        }

        .tagline-dot {
          color: var(--green-mid);
          margin: 0 0.35em;
        }

        /* === FORM === */
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .form-label-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
        }

        .form-label-wrap:nth-child(1) { animation-delay: 0.55s; }
        .form-label-wrap:nth-child(2) { animation-delay: 0.65s; }

        .form-label {
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-dim);
          padding-left: 2px;
          transition: color 0.3s ease;
        }

        .form-label.active { color: var(--green-bright); }

        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          width: 16px; height: 16px;
          color: var(--text-muted);
          transition: color 0.3s ease;
          z-index: 2;
          pointer-events: none;
        }

        .input-wrap:focus-within .input-icon { color: var(--green-bright); }

        .form-input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 2.75rem;
          background: rgba(0, 255, 135, 0.03);
          border: 1px solid rgba(0, 255, 135, 0.1);
          border-radius: 12px;
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 400;
          outline: none;
          transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
          caret-color: var(--green-bright);
        }

        .form-input::placeholder { color: var(--text-muted); }

        .form-input:hover {
          border-color: rgba(0, 255, 135, 0.22);
          background: rgba(0, 255, 135, 0.05);
        }

        .form-input:focus {
          border-color: rgba(0, 255, 135, 0.5);
          background: rgba(0, 255, 135, 0.06);
          box-shadow: 0 0 0 3px rgba(0,255,135,0.08), 0 0 20px rgba(0,255,135,0.06);
        }

        /* === SUBMIT BUTTON === */
        .submit-wrap {
          margin-top: 0.5rem;
          opacity: 0;
          animation: fadeUp 0.5s ease 0.75s forwards;
        }

        .submit-btn {
          width: 100%;
          padding: 0.95rem 1.5rem;
          background: linear-gradient(135deg, var(--green-mid) 0%, var(--green-deep) 100%);
          border: none;
          border-radius: 12px;
          color: #001a0a;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.06em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
          box-shadow: 0 4px 20px rgba(0,201,106,0.3), 0 1px 0 rgba(255,255,255,0.1) inset;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,201,106,0.45), 0 1px 0 rgba(255,255,255,0.1) inset;
          filter: brightness(1.1);
        }

        .submit-btn:hover:not(:disabled)::before { opacity: 1; }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
        }

        /* Spinner */
        .spinner {
          width: 17px; height: 17px;
          border: 2px solid rgba(0,26,10,0.3);
          border-top-color: #001a0a;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* === ERROR === */
        .error-box {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.85rem 1rem;
          background: rgba(255, 60, 60, 0.07);
          border: 1px solid rgba(255, 80, 80, 0.2);
          border-radius: 10px;
          color: #ff8080;
          font-size: 0.82rem;
          line-height: 1.45;
          font-weight: 400;
          margin-top: 0.3rem;
          animation: errorShake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
          opacity: 0;
          transform-origin: top;
        }

        .error-box.visible {
          animation: errorReveal 0.3s ease forwards, errorShake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        @keyframes errorReveal {
          to { opacity: 1; }
        }

        @keyframes errorShake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(3px); }
          30%, 50%, 70% { transform: translateX(-3px); }
          40%, 60% { transform: translateX(3px); }
        }

        .error-icon {
          width: 15px; height: 15px;
          flex-shrink: 0;
          margin-top: 1px;
          color: #ff6060;
        }

        /* === DIVIDER / FOOTER === */
        .card-footer {
          margin-top: 1.75rem;
          text-align: center;
          opacity: 0;
          animation: fadeUp 0.5s ease 0.85s forwards;
        }

        .footer-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(0,255,135,0.1), transparent);
        }

        .divider-text {
          font-size: 0.68rem;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .footer-stat-row {
          display: flex;
          justify-content: center;
          gap: 2rem;
        }

        .footer-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
        }

        .stat-val {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          color: var(--green-bright);
        }

        .stat-lbl {
          font-size: 0.63rem;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* === BADGE === */
        .badge {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.6rem;
          border-radius: 20px;
          background: rgba(0,255,135,0.07);
          border: 1px solid rgba(0,255,135,0.15);
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--green-mid);
        }

        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--green-bright);
          box-shadow: 0 0 6px var(--green-bright);
          animation: blink 1.8s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        /* RESPONSIVE */
        @media (max-width: 480px) {
          .login-card { padding: 2.25rem 1.5rem 2rem; }
          .logo-title { font-size: 1.4rem; }
          .footer-stat-row { gap: 1.25rem; }
        }
      `}</style>

      <div className="page-wrapper">
        {/* Backgrounds */}
        <div className="bg-mesh">
          <div className="mesh-orb orb-1" />
          <div className="mesh-orb orb-2" />
          <div className="mesh-orb orb-3" />
        </div>
        <div className="bg-grid" />
        <div className="scan-line" />

        {/* Card */}
        <div className="card-container" style={{ opacity: mounted ? undefined : 0 }}>
          <div className="card-glow" aria-hidden="true">
            <div className="card-glow-inner" />
          </div>

          <div className="login-card">
            <div className="card-shimmer" />

            {/* Live badge */}
            <div className="badge">
              <span className="badge-dot" />
              System Live
            </div>

            {/* Logo */}
            <div className="logo-section">
              <div className="logo-icon-wrap">
                <div className="logo-icon-bg" />
                <div className="logo-pulse" />
                <div className="logo-pulse-2" />
                <svg className="logo-svg" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M18 4L6 11v14l12 7 12-7V11L18 4z" stroke="rgba(0,255,135,0.3)" strokeWidth="1.2" fill="none"/>
                  <path d="M18 8L9 13v10l9 5 9-5V13L18 8z" stroke="rgba(0,255,135,0.6)" strokeWidth="1" fill="rgba(0,255,135,0.05)"/>
                  <circle cx="18" cy="18" r="4" fill="rgba(0,255,135,0.9)" />
                  <circle cx="18" cy="18" r="2" fill="#001a0a" />
                  <line x1="18" y1="8" x2="18" y2="14" stroke="rgba(0,255,135,0.5)" strokeWidth="1"/>
                  <line x1="18" y1="22" x2="18" y2="28" stroke="rgba(0,255,135,0.5)" strokeWidth="1"/>
                  <line x1="9" y1="13" x2="14.5" y2="16" stroke="rgba(0,255,135,0.5)" strokeWidth="1"/>
                  <line x1="21.5" y1="20" x2="27" y2="23" stroke="rgba(0,255,135,0.5)" strokeWidth="1"/>
                  <line x1="27" y1="13" x2="21.5" y2="16" stroke="rgba(0,255,135,0.5)" strokeWidth="1"/>
                  <line x1="14.5" y1="20" x2="9" y2="23" stroke="rgba(0,255,135,0.5)" strokeWidth="1"/>
                </svg>
              </div>

              <div>
                <h1 className="logo-title">
                  <span>ANN AI</span>
                </h1>
                <p className="logo-tagline">
                  Predict Smart
                  <span className="tagline-dot">·</span>
                  Cook Right
                  <span className="tagline-dot">·</span>
                  Waste Less
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="form-section" noValidate>
              {/* Username */}
              <div className="form-label-wrap">
                <label
                  htmlFor="username"
                  className={`form-label ${focusedField === "username" ? "active" : ""}`}
                >
                  Username
                </label>
                <div className="input-wrap">
                  <svg className="input-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M1.5 13.5c0-3 3-4.5 6.5-4.5s6.5 1.5 6.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  <input
                    id="username"
                    type="text"
                    className="form-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField(null)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-label-wrap">
                <label
                  htmlFor="password"
                  className={`form-label ${focusedField === "password" ? "active" : ""}`}
                >
                  Password
                </label>
                <div className="input-wrap">
                  <svg className="input-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect x="2" y="7" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="8" cy="11" r="1.2" fill="currentColor"/>
                  </svg>
                  <input
                    id="password"
                    type="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {showError && (
                <div className="error-box visible" role="alert">
                  <svg className="error-icon" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M7.5 1L1 13h13L7.5 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    <line x1="7.5" y1="6" x2="7.5" y2="9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <circle cx="7.5" cy="11.2" r="0.7" fill="currentColor"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <div className="submit-wrap">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                  aria-busy={loading}
                >
                  <span className="btn-content">
                    {loading ? (
                      <>
                        <span className="spinner" aria-hidden="true" />
                        Authenticating…
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Sign In to Dashboard
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Footer stats */}
            <div className="card-footer">
              <div className="footer-divider">
                <div className="divider-line" />
                <span className="divider-text">Powered by Neural AI</span>
                <div className="divider-line" />
              </div>
              <div className="footer-stat-row">
                <div className="footer-stat">
                  <span className="stat-val">30%</span>
                  <span className="stat-lbl">Waste Reduced</span>
                </div>
                <div className="footer-stat">
                  <span className="stat-val">98.2%</span>
                  <span className="stat-lbl">Accuracy</span>
                </div>
                <div className="footer-stat">
                  <span className="stat-val">Live</span>
                  <span className="stat-lbl">Predictions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}