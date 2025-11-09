export default function TermsOfUse() {
  return (
    <div className="min-h-[100dvh] bg-[#191919] text-[#E3E2E0]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using Omori Cloud ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Use, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Omori Cloud is a diary application that provides users with the ability to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>Create, edit, and manage diary entries</li>
              <li>Search diary entries using embedding-based search technology</li>
              <li>Receive similarity recommendations for diary entries</li>
              <li>Integrate with Notion to import and export diary entries</li>
              <li>Keep diary entries synchronized between Omori Cloud and Notion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                To use Omori Cloud, you must create an account using Google Sign-In. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              <p>
                You agree to immediately notify us of any unauthorized use of your account or any other breach of security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                You retain all rights to the diary entries and content you create using Omori Cloud ("User Content"). By using the Service, you grant us a limited, non-exclusive license to store, process, and display your User Content solely for the purpose of providing the Service to you.
              </p>
              <p>
                You are solely responsible for your User Content and represent and warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
                <li>You own or have the necessary rights to use and authorize us to use your User Content</li>
                <li>Your User Content does not violate any third-party rights, including intellectual property rights</li>
                <li>Your User Content does not violate any applicable laws or regulations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Notion Integration</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                If you choose to connect your Notion account, you acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
                <li>Your use of Notion is subject to Notion's Terms of Service and Privacy Policy</li>
                <li>We will access and sync data between Omori Cloud and your Notion workspace as necessary for the integration to function</li>
                <li>You can disconnect the Notion integration at any time</li>
                <li>We are not responsible for any issues arising from your use of Notion or the Notion integration</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 leading-relaxed ml-4">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Attempt to gain unauthorized access to the Service or its related systems</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Use automated systems to access the Service without our prior written consent</li>
              <li>Share your account credentials with others</li>
              <li>Use the Service to transmit any malicious code, viruses, or harmful data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              The Service, including its original content, features, and functionality, is owned by Omori Cloud and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works of the Service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
            <p className="text-gray-300 leading-relaxed">
              We strive to provide reliable service but do not guarantee that the Service will be available at all times. The Service may be temporarily unavailable due to maintenance, updates, or unforeseen circumstances. We are not liable for any loss or damage resulting from Service unavailability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              To the maximum extent permitted by law, Omori Cloud shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including if you breach these Terms of Use. Upon termination, your right to use the Service will cease immediately, and we may delete your account and User Content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms of Use at any time. We will notify you of any changes by posting the new Terms of Use on this page and updating the "Last updated" date. Your continued use of the Service after such modifications constitutes your acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms of Use shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Use, please contact us at{" "}
              <a href="mailto:legal@omori.cloud" className="text-blue-400 hover:text-blue-300 underline">
                legal@omori.cloud
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

