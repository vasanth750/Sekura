import { Link } from 'react-router-dom';
export default function Footer() {
    return (

        <footer className="bg-blue-200 py-4 w-full">


            <div className='grid grid-cols-1 md:grid-cols-4 gap-2 mt-3'>
                <div className='flex justify-between'>
                    <div>
                    <p>
                        © 2026 Sekura Inc. All rights reserved
                    </p>
                    </div>
                    <div>
                        <Link to='/privacy-policy'
                            className='text-black-400 no-underline font-semibold'>
                            Privacy Policy
                        </Link>

                        <Link to='/terms-condition'
                            className='text-black-400 no-underline font-semibold'>
                            Terms & Conditions
                        </Link>

                        <Link to='/contact-us'
                            className='text-black-400 no-underline font-semibold'>
                            Contact us
                        </Link>
                    </div>
                </div>
            </div>


        </footer>

    );
}