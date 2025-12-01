import Link from "next/link";
import { GlassCard } from "@/components";

export const metadata = {
  title: "Support - scottd3v",
  description: "Get help and support for scottd3v apps.",
};

export default function Support() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Back Navigation */}
      <header className="px-6 pt-8 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </Link>
      </header>

      <main className="px-6 pb-12">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">Support</h1>
          <p className="text-zinc-400 mb-8">How can we help?</p>

          {/* Contact Options */}
          <div className="grid gap-4 mb-10">
            <a href="mailto:scottd3v@gmail.com">
              <GlassCard
                icon={<span className="text-2xl">✉️</span>}
                title="Email Support"
                subtitle="scottd3v@gmail.com"
                size="wide"
              />
            </a>
          </div>

          {/* FAQ Section */}
          <h2 className="text-xl font-semibold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="glass p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">
                How do I start a dead hang session?
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                Open the app on your Apple Watch, then tap the Start button.
                The timer will begin when you&apos;re ready. Tap again to stop when you
                release the bar.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-2">
                Is my data backed up?
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                Your data is stored locally on your device and included in your
                iCloud backup if you have iCloud Backup enabled for your iPhone.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-2">
                Can I sync between devices?
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                Currently, data is stored locally on each device. Your iPhone and
                Apple Watch share data through the Watch connectivity framework.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-2">
                How do I delete my data?
              </h3>
              <p className="text-zinc-300 leading-relaxed">
                You can clear all data from the Settings screen within the app,
                or by uninstalling and reinstalling the app.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
