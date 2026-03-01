import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — ReachFire",
  description: "ReachFire Privacy Policy. We collect no personal data. All calculations run in your browser.",
};

const EFFECTIVE_DATE = "February 28, 2026";

export default function PrivacyPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-10">Effective date: {EFFECTIVE_DATE}</p>

      {/* TL;DR */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 mb-10 flex gap-4">
        <Shield className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm mb-1">The short version</p>
          <p className="text-sm text-muted-foreground">
            ReachFire collects no personal information. All calculations run entirely in your browser.
            We have no accounts, no database of user data, no advertising, and no analytics tracking.
            The only optional exception is the AI Insights feature, described in detail below.
          </p>
        </div>
      </div>

      <div className="space-y-10 text-sm leading-relaxed">

        <section>
          <h2 className="text-lg font-semibold mb-3">1. Who We Are</h2>
          <p className="text-muted-foreground">
            ReachFire (&quot;we,&quot; &quot;us,&quot; or &quot;the Service&quot;) is a free,
            browser-based FIRE (Financial Independence, Retire Early) planning tool. This Privacy
            Policy explains what information we collect (if any), how we use it, and your rights
            regarding that information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">2. Information We Do NOT Collect</h2>
          <p className="text-muted-foreground mb-3">We do not collect, store, or transmit:</p>
          <ul className="space-y-2 text-muted-foreground">
            {[
              "Your name, email address, or any contact information",
              "Your financial data (income, savings, portfolio value, expenses, etc.) — these exist only in your browser's memory and are discarded when you close or refresh the page",
              "Your IP address (beyond what is standard in any HTTP request to load the page)",
              "Browser fingerprints, device identifiers, or tracking cookies",
              "Location data",
              "Usage analytics or behavioral tracking data",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-emerald-500 shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">3. How the Service Works (Technical)</h2>
          <p className="text-muted-foreground">
            All ReachFire calculators are implemented as client-side JavaScript that runs in your
            browser. When you enter numbers into any calculator, those values are stored only in your
            browser&apos;s memory (React state). They are never sent to a server, never written to a
            database, and are lost when you navigate away or close the tab.
          </p>
          <p className="text-muted-foreground mt-3">
            The shareable URL feature (the &quot;Share&quot; button) encodes your calculator inputs
            as URL query parameters. This URL is generated entirely in your browser and copied to
            your clipboard. If you choose to share that URL with someone, the recipient&apos;s browser
            will read the parameters to pre-fill the calculator — no server is involved. We never
            see or log the URLs you generate.
          </p>
        </section>

        <section className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h2 className="text-lg font-semibold mb-3">4. AI Insights Feature (Optional)</h2>
          <p className="text-muted-foreground mb-3">
            The optional &quot;Get AI Analysis&quot; feature in the FIRE Calculator sends data to
            Anthropic&apos;s Claude API. This only occurs when you explicitly click the &quot;Get AI
            Analysis&quot; button. It is never triggered automatically.
          </p>
          <p className="text-muted-foreground mb-3">
            <strong className="text-foreground">What is sent:</strong> A set of anonymized numerical
            parameters — your age, savings rate, years to FIRE, FIRE number, current portfolio value,
            annual expenses, annual income, monthly savings, expected return, and withdrawal rate.
          </p>
          <p className="text-muted-foreground mb-3">
            <strong className="text-foreground">What is NOT sent:</strong> Your name, email, IP
            address, location, or any personally identifying information. The parameters are
            indistinguishable from those of any other user with similar numbers.
          </p>
          <p className="text-muted-foreground">
            Anthropic&apos;s handling of this data is governed by{" "}
            <strong className="text-foreground">Anthropic&apos;s Privacy Policy</strong>. ReachFire
            does not store the AI responses on any server — they are displayed in your browser only.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">5. Cookies and Tracking</h2>
          <p className="text-muted-foreground">
            ReachFire uses one functional browser storage mechanism: your theme preference (light or
            dark mode) is saved to <code className="bg-secondary px-1 rounded">localStorage</code> so
            it persists across visits. This stores only the string &quot;light&quot; or &quot;dark&quot;
            — no personal information.
          </p>
          <p className="text-muted-foreground mt-3">
            We use no advertising cookies, no analytics cookies, no third-party tracking pixels, and
            no cross-site tracking of any kind.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">6. Third-Party Services</h2>
          <p className="text-muted-foreground">
            ReachFire is hosted on Vercel. When you load the page, your browser makes a standard HTTP
            request to Vercel&apos;s servers, which may log your IP address and request metadata as
            part of standard server operation. This is governed by{" "}
            <strong className="text-foreground">Vercel&apos;s Privacy Policy</strong>. We do not have
            access to or control over Vercel&apos;s server logs.
          </p>
          <p className="text-muted-foreground mt-3">
            Google Fonts may be loaded for the Geist and Instrument Serif typefaces, which means your
            browser makes a request to Google&apos;s servers. This is subject to{" "}
            <strong className="text-foreground">Google&apos;s Privacy Policy</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">7. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground">
            ReachFire is not directed to children under the age of 13. Because we collect no personal
            information from any user, we do not collect personal information from children either.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">8. Your Data Rights</h2>
          <p className="text-muted-foreground">
            Because we collect no personal data, there is nothing for us to provide, correct, export,
            or delete. Your financial inputs exist only in your browser&apos;s memory and are gone
            when you close the tab — they were never ours to hold.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">9. Data Security</h2>
          <p className="text-muted-foreground">
            Since we do not store your financial data, there is no server-side database of your
            information that could be breached. Your data exists only in your browser and is under
            your own control. We serve the Service over HTTPS to protect data in transit.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">10. Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this Privacy Policy from time to time. We will indicate the updated
            effective date at the top of this page. Your continued use of the Service after any
            changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
          <strong className="text-foreground">Questions?</strong> If you have any questions about
          this Privacy Policy, please review our{" "}
          <a href="/terms" className="underline hover:text-foreground">Terms of Service</a> or
          the <a href="/about" className="underline hover:text-foreground">methodology page</a>.
        </div>
      </div>
    </div>
  );
}
