import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Dead Hang Tracker",
  description: "Privacy policy for the Dead Hang Tracker iOS and watchOS app.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Back Navigation */}
      <header className="px-6 pt-8 pb-4">
        <Link
          href="/dead-hang-tracker"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Dead Hang Tracker</span>
        </Link>
      </header>

      <main className="px-6 pb-12">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-zinc-400 mb-8">Last updated: November 2025</p>

          <div className="glass p-6 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
              <p className="text-zinc-300 leading-relaxed">
                Dead Hang Tracker is designed with your privacy in mind. We believe your
                fitness data belongs to you and only you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Data Collection</h2>
              <p className="text-zinc-300 leading-relaxed mb-3">
                <strong className="text-white">We do not collect any personal data.</strong>
              </p>
              <p className="text-zinc-300 leading-relaxed">
                All your hang times, progress data, and settings are stored locally on your
                device using Apple&apos;s secure on-device storage. This data never leaves your
                device and is not transmitted to any servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Third-Party Services</h2>
              <p className="text-zinc-300 leading-relaxed">
                Dead Hang Tracker does not integrate with any third-party analytics,
                advertising, or tracking services. We do not share your data with anyone.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Apple Health Integration</h2>
              <p className="text-zinc-300 leading-relaxed">
                If you choose to enable Apple Health integration, your workout data may be
                shared with the Health app according to your preferences. This data is
                handled by Apple and subject to Apple&apos;s privacy policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Data Deletion</h2>
              <p className="text-zinc-300 leading-relaxed">
                Since all data is stored locally on your device, you can delete all app
                data by uninstalling the app. No data remains on any external servers
                because none was ever transmitted.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
              <p className="text-zinc-300 leading-relaxed">
                If you have any questions about this privacy policy, please contact us at{" "}
                <a href="mailto:scottd3v@gmail.com" className="text-blue-400 hover:text-blue-300">
                  scottd3v@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
