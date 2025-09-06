import React from "react";

function TermsConditions() {
  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center">Terms & Conditions</h1>
      <div className="card shadow-sm p-4">
        <p className="text-muted">
          Welcome to <strong>Deals In My City!</strong> By accessing or using our website, 
          you agree to comply with and be bound by the following Terms and Conditions. 
          Please read them carefully before using our services.
        </p>

        <h4 className="mt-4">1. Acceptance of Terms</h4>
        <p>
          By using our platform, you agree to be legally bound by these Terms. 
          If you do not agree, please discontinue use of our site and services.
        </p>

        <h4 className="mt-4">2. Services Provided</h4>
        <p>
          Our platform allows users to explore ongoing deals and offers from 
          various stores and restaurants. While we strive to keep all information 
          accurate and up-to-date, we do not guarantee availability, accuracy, 
          or quality of any deal listed.
        </p>

        <h4 className="mt-4">3. User Responsibilities</h4>
        <ul>
          <li>You agree to use our site only for lawful purposes.</li>
          <li>You must not attempt to hack, disrupt, or misuse the platform.</li>
          <li>Store owners are responsible for the accuracy of deals they post.</li>
        </ul>

        <h4 className="mt-4">4. Limitation of Liability</h4>
        <p>
          We are not responsible for any direct or indirect losses resulting 
          from the use of our services, including expired deals, incorrect 
          information, or third-party issues.
        </p>

        <h4 className="mt-4">5. Privacy</h4>
        <p>
          Your privacy is important to us. Any information collected will be 
          handled in accordance with our <a href="/PrivacyPolicy">Privacy Policy</a>.
        </p>

        <h4 className="mt-4">6. Changes to Terms</h4>
        <p>
          We reserve the right to update or modify these Terms & Conditions 
          at any time. Continued use of the site after changes indicates 
          acceptance of the updated terms.
        </p>

        <h4 className="mt-4">7. Contact Us</h4>
        <p>
          If you have any questions about these Terms, please contact us at:
          <br />
          📧 <a href="mailto:askdealsinmycity@gmail.com">askdealsinmycity@gmail.com</a>
        </p>

        <p className="text-muted mt-4">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export default TermsConditions;
