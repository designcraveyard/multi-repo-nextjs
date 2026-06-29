"use client";

// --- Login Screen ---
// Figma node 108:5991 — "Login" frame from bubbles-kit
// Layout: green hero top, "Get Started" section, email input, 3 auth buttons
// responsive: N/A — single-column form works at all sizes, centered on desktop

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/Button";
import { InputField } from "@/app/components/InputField";
import { Icon } from "@/app/components/icons";
import {
  signInWithEmail,
  signUpWithEmail,
} from "@/lib/auth/actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const oauthLinkClass = [
    "inline-flex items-center justify-center rounded-full",
    "select-none whitespace-nowrap",
    "h-12 px-5 py-3 gap-3",
    "bg-[var(--surfaces-brand-interactive-low-contrast)] text-[var(--typography-brand)]",
    "hover:bg-[var(--surfaces-brand-interactive-low-contrast-hover)]",
    "active:bg-[var(--surfaces-brand-interactive-low-contrast-pressed)]",
    "cursor-pointer transition-colors duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus-visible:ring-[var(--border-brand)]",
  ].join(" ");
  const oauthIconClass = "w-6 h-6 flex-shrink-0 flex items-center justify-center";
  const oauthLabelClass =
    "text-[length:var(--typography-cta-lg-size)] leading-[var(--typography-cta-lg-leading)] font-[var(--typography-cta-lg-weight)]";

  async function handleEmailAuth() {
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);

    const result = isSignUp
      ? await signUpWithEmail(formData)
      : await signInWithEmail(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--surfaces-base-primary)] flex flex-col">
      <nav className="absolute left-6 top-6 z-10 flex flex-wrap items-center gap-[var(--space-2)]">
        <Link
          href="/components-showcase"
          className="rounded-full bg-[var(--surfaces-base-primary)] px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--typography-cta-md-size)] font-[var(--typography-cta-md-weight)] text-[var(--typography-brand)] shadow-sm"
        >
          Components
        </Link>
        <Link
          href="/login"
          className="rounded-full bg-[var(--surfaces-brand-interactive)] px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--typography-cta-md-size)] font-[var(--typography-cta-md-weight)] text-[var(--typography-on-brand-primary)] shadow-sm"
        >
          Login
        </Link>
      </nav>
      {/* --- Hero area --- */}
      <div className="h-[45vh] min-h-[200px] bg-[var(--surfaces-success-subtle)]" />

      {/* --- Auth form --- */}
      <div className="flex-1 flex justify-center px-6 py-8">
        <div className="w-full max-w-sm flex flex-col gap-6">
          {/* --- Section header --- */}
          <h1 className="text-[length:var(--typography-title-sm-size)] font-bold leading-[var(--line-height-6)] text-[var(--typography-primary)]">
            {isSignUp ? "Create Account" : "Get Started"}
          </h1>

          {/* --- Email input --- */}
          <InputField
            id="login-email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leadingIcon={<Icon name="Envelope" size="md" />}
          />

          {/* --- Password input --- */}
          <InputField
            id="login-password"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leadingIcon={<Icon name="Lock" size="md" />}
          />

          {/* --- Error message --- */}
          {error && (
            <p className="text-[length:var(--typography-caption-md-size)] text-[var(--surfaces-error-interactive)]">
              {error}
            </p>
          )}

          {/* --- Auth buttons --- */}
          <div className="flex flex-col gap-3">
            <Button
              label={isSignUp ? "Sign Up with Email" : "Login via Email"}
              variant="primary"
              size="lg"
              leadingIcon={<Icon name="EnvelopeSimple" size="md" />}
              trailingIcon={<Icon name="ArrowRight" size="md" />}
              isLoading={isLoading}
              onClick={handleEmailAuth}
            />

            <Link href="/auth/oauth/apple" className={oauthLinkClass}>
              <span className={oauthIconClass} aria-hidden="true">
                <Icon name="AppleLogo" size="md" />
              </span>
              <span className={oauthLabelClass}>Login via Apple</span>
              <span className={oauthIconClass} aria-hidden="true">
                <Icon name="ArrowRight" size="md" />
              </span>
            </Link>

            <Link href="/auth/oauth/google" className={oauthLinkClass}>
              <span className={oauthIconClass} aria-hidden="true">
                <Icon name="GoogleLogo" size="md" />
              </span>
              <span className={oauthLabelClass}>Login via Google</span>
              <span className={oauthIconClass} aria-hidden="true">
                <Icon name="ArrowRight" size="md" />
              </span>
            </Link>
          </div>

          {/* --- Toggle sign up / sign in --- */}
          <p className="text-center text-[length:var(--typography-body-md-size)] text-[var(--typography-muted)]">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-[var(--typography-brand)] font-semibold"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
