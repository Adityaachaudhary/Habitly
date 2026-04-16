import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function PrivacyPolicyPage() {
  useTheme() // ensure theme vars are applied

  return (
    <div className="min-h-screen font-body" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top bar */}
      <nav className="px-6 py-5 border-b flex items-center gap-4" style={{ borderColor: 'var(--border)' }}>
        <Link to="/" className="flex items-center gap-2 text-sm font-semibold opacity-70">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        <header className="space-y-3">
          <h1 className="font-display font-black text-4xl">Privacy Policy</h1>
          <p className="text-sm opacity-50">Last updated — April 16, 2026</p>
        </header>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">1. Information We Collect</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            When you create an account, we collect your email address and display name. As you use Habitly, we store your habit data, completion records, and application preferences. We also collect basic usage analytics such as page views and feature interactions to improve the service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">2. How We Use Your Information</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            Your data is used to provide and personalize the Habitly experience, including generating analytics, streaks, and — when available — AI-powered coaching insights. We do not sell, rent, or trade your personal information to third parties. Aggregated, anonymized data may be used to improve our algorithms and product.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">3. Data Storage &amp; Security</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            All data is stored securely using Supabase infrastructure with row-level security enabled. Communication between your browser and our servers is encrypted via TLS. We apply industry-standard practices to protect your information from unauthorized access, alteration, or destruction.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">4. Cookies &amp; Local Storage</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            Habitly uses essential cookies and browser local storage to maintain your authentication session and theme preferences. We do not use tracking cookies or third-party advertising pixels.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">5. Your Rights</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            You may request access to, correction of, or deletion of your personal data at any time by contacting us at <a href="mailto:hello@habitly.app" className="text-primary-600 font-semibold">hello@habitly.app</a>. Upon account deletion, all associated data will be permanently removed within 30 days.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">6. Third-Party Services</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            We use the following third-party services to operate Habitly:
          </p>
          <ul className="list-disc list-inside space-y-2 opacity-80" style={{ color: 'var(--muted)' }}>
            <li><strong>Supabase</strong> — Authentication and database hosting</li>
            <li><strong>Vercel</strong> — Application hosting and deployment</li>
          </ul>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            Each service operates under its own privacy policy. We recommend reviewing their policies for additional detail.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">7. Changes to This Policy</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            We may update this Privacy Policy from time to time. If we make significant changes, we will notify you via email or an in-app notice. Continued use of Habitly after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">8. Contact Us</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            If you have questions or concerns about this Privacy Policy, please reach out to us at{' '}
            <a href="mailto:hello@habitly.app" className="text-primary-600 font-semibold">hello@habitly.app</a>.
          </p>
        </section>
      </main>

      <footer className="py-8 px-6 border-t text-center text-xs opacity-40" style={{ borderColor: 'var(--border)' }}>
        © 2026 Habitly. All rights reserved.
      </footer>
    </div>
  )
}
