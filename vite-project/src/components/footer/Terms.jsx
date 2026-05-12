export default function TermsConditions() {

    return (

        <div className="max-w-5xl mx-auto p-8 text-gray-800">

            <h1 className="text-4xl font-bold mb-6">
                Terms & Conditions
            </h1>

            <p className="text-gray-600 mb-6">
                By accessing and using Sekura, you agree to comply with the
                following terms and conditions. Please read them carefully before
                using our services.
            </p>

            {/* Section 1 */}
            <div className="mb-8">

                <h2 className="text-2xl font-semibold mb-3">
                    Acceptance of Terms
                </h2>

                <p className="text-gray-600">
                    By creating an account or accessing Sekura, users agree to
                    abide by all security policies, platform guidelines, and
                    applicable laws and regulations.
                </p>

            </div>

            {/* Section 2 */}
            <div className="mb-8">

                <h2 className="text-2xl font-semibold mb-3">
                    Account Responsibility
                </h2>

                <p className="text-gray-600">
                    Users are responsible for maintaining the confidentiality
                    of their account credentials and activities performed under
                    their accounts.
                </p>

            </div>

            {/* Section 3 */}
            <div className="mb-8">

                <h2 className="text-2xl font-semibold mb-3">
                    Prohibited Activities
                </h2>

                <p className="text-gray-600">
                    Users must not misuse the platform for unauthorized access,
                    malicious attacks, illegal data storage, or activities that
                    violate cybersecurity regulations.
                </p>

            </div>

            {/* Section 4 */}
            <div className="mb-8">

                <h2 className="text-2xl font-semibold mb-3">
                    Service Availability
                </h2>

                <p className="text-gray-600">
                    Sekura strives to maintain uninterrupted service but does not
                    guarantee continuous availability due to maintenance,
                    technical issues, or external disruptions.
                </p>

            </div>

            {/* Section 5 */}
            <div className="mb-8">

                <h2 className="text-2xl font-semibold mb-3">
                    Modifications
                </h2>

                <p className="text-gray-600">
                    Sekura reserves the right to modify these terms at any time.
                    Continued use of the platform after updates constitutes
                    acceptance of the revised terms.
                </p>

            </div>

        </div>

    );
}