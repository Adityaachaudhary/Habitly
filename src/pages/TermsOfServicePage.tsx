import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function TermsOfServicePage() {
  useTheme()

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
          <h1 className="font-display font-black text-4xl">Terms of Service</h1>
          <p className="text-sm opacity-50">Last updated — April 16, 2026</p>
        </header>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">1. Acceptance of Terms</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            By accessing or using Habitly ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. We reserve the right to update these terms at any time, and your continued use constitutes acceptance of any changes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">2. Description of Service</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            Habitly is a web-based habit tracking platform that allows users to create, track, and analyze daily habits. Features include streak tracking, analytics dashboards, achievement systems, and — in future releases — AI-powered coaching and social leaderboards.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">3. User Accounts</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and to update it as needed. You must notify us immediately of any unauthorized use of your account. Habitly is not liable for any loss resulting from unauthorized account access.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">4. Acceptable Use</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            You agree not to misuse the Service. This includes, but is not limited to:
          </p>
          <ul className="list-disc list-inside space-y-2 opacity-80" style={{ color: 'var(--muted)' }}>
            <li>Attempting to gain unauthorized access to any part of the Service</li>
            <li>Using the Service to transmit harmful, offensive, or illegal content</li>
            <li>Interfering with the proper functioning of the Service</li>
            <li>Scraping, data mining, or automated collection of data from the Service</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">5. Intellectual Property</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            All content, design, graphics, and software associated with Habitly are the property of Habitly and are protected by applicable intellectual property laws. You retain ownership of the data you input into the Service, but grant Habitly a limited license to process and display it as part of the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">6. Service Availability</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            We strive to keep Habitly available at all times but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We will make reasonable efforts to notify users in advance of planned downtime.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">7. Limitation of Liability</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            Habitly is provided "as is" without warranties of any kind, either express or implied. To the fullest extent permitted by law, Habitly shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">8. Termination</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            You may delete your account at any time through the Settings page. We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, your data will be deleted in accordance with our <Link to="/privacy" className="font-semibold" style={{ color: 'var(--primary-600)' }}>Privacy Policy</Link>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">9. Governing Law</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            These terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms or the Service will be resolved through good-faith negotiation before pursuing formal legal proceedings.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display font-bold text-xl">10. Contact Us</h2>
          <p className="leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
            If you have questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:hello@habitly.app" className="font-semibold" style={{ color: 'var(--primary-600)' }}>hello@habitly.app</a>.
          </p>
        </section>
      </main>

      <footer className="py-8 px-6 border-t text-center text-xs opacity-40" style={{ borderColor: 'var(--border)' }}>
        © 2026 Habitly. All rights reserved.
      </footer>
    </div>
  )
}
