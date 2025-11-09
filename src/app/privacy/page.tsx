export default function PrivacyPolicy() {
  return (
    <div className="min-h-[100dvh] bg-[#191919] text-[#E3E2E0]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to Omori Cloud ("we," "our," or "us"). Omori Cloud is a diary application that allows users to write, manage, and interact with their diary entries. We are committed to protecting your privacy and ensuring the security of your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                <strong className="text-[#E3E2E0]">Account Information:</strong> When you sign in with Google, we collect your email address and basic profile information provided by Google.
              </p>
              <p>
                <strong className="text-[#E3E2E0]">Diary Entries:</strong> We store the diary entries you create, edit, and save through our application. This content is stored securely and is only accessible to you.
              </p>
              <p>
                <strong className="text-[#E3E2E0]">Notion Integration Data:</strong> If you choose to connect your Notion account, we may access and sync diary entries between Omori Cloud and your Notion workspace. We only access the data necessary for the integration to function.
              </p>
              <p>
                <strong className="text-[#E3E2E0]">Usage Data:</strong> We may collect information about how you interact with our service, including search queries and feature usage, to improve our services.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>To provide and maintain our diary service</li>
              <li>To enable Notion integration features, including importing and exporting diary entries</li>
              <li>To provide embedding-based search functionality for finding related diary entries</li>
              <li>To generate similarity recommendations for your diary entries</li>
              <li>To improve and optimize our services</li>
              <li>To communicate with you about your account or our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We use Convex as our backend infrastructure to store your data securely. All data is encrypted in transit and at rest. We implement industry-standard security measures to protect your information from unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                <strong className="text-[#E3E2E0]">Google Authentication:</strong> We use Google Sign-In for authentication. Your use of Google Sign-In is subject to Google's Privacy Policy.
              </p>
              <p>
                <strong className="text-[#E3E2E0]">Notion Integration:</strong> When you connect your Notion account, your use of Notion is subject to Notion's Privacy Policy and Terms of Service. We only access the data necessary for the integration to function.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>Access your personal data and diary entries</li>
              <li>Delete your account and all associated data</li>
              <li>Export your diary entries</li>
              <li>Disconnect your Notion integration at any time</li>
              <li>Request correction of inaccurate data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain your diary entries and account information for as long as your account is active. If you delete your account, we will delete your personal data and diary entries within 30 days, except where we are required to retain it by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@omori.cloud" className="text-blue-400 hover:text-blue-300 underline">
                privacy@omori.cloud
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

