import { Link } from 'react-router-dom';

export default function Footer() {

  return (

    <footer className="bg-blue-200 w-full py-4 border-t border-gray-300">

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-6">

        {/* Left Side */}
        <div className="text-center md:text-left">

          <p className="text-gray-700 text-sm">

            © 2026 Sekura Inc. All rights reserved

          </p>

        </div>

        {/* Right Side */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-sm font-semibold">

          <Link
            to='/privacy-policy'
            className='text-gray-700 hover:text-blue-700 transition-all no-underline'
          >
            Privacy Policy
          </Link>

          <Link
            to='/terms-condition'
            className='text-gray-700 hover:text-blue-700 transition-all no-underline'
          >
            Terms & Conditions
          </Link>

          <Link
            to='/contact-us'
            className='text-gray-700 hover:text-blue-700 transition-all no-underline'
          >
            Contact Us
          </Link>

        </div>

      </div>

    </footer>

  );
}