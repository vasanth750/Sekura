import {
  Routes,
  Route,
  useLocation,
  Navigate
} from 'react-router-dom';

import Signup from './Pages/Signup.jsx';
import Login from './Pages/Login.jsx';
import Footer from './components/footer/Footer.jsx';
import Header from './components/header/Header.jsx';
import Secrets from './Pages/Secrets.jsx';

import Privacy from './components/footer/Privacy.jsx';
import Terms from './components/footer/Terms.jsx';
import Contact from './components/footer/Contact.jsx';
import Dashboard from './Pages/dashBoard.jsx';
function Layout() {

  const location = useLocation();

  const hideHeaderFooterRoutes = ['/login', '/signup'];

  return (

    <div className='min-h-screen flex flex-col'>

      {
        !hideHeaderFooterRoutes.includes(location.pathname)
        &&
        <Header />
      }
      <main className='flex-grow'>
        <Routes>

          <Route path='/' element={<Navigate to="/login" />} />

          <Route path='/login' element={<Login />} />

          <Route path='/signup' element={<Signup />} />

          <Route path='/secrets' element={<Secrets />} />
         
        <Route path='/dashBoard' element={<Dashboard />} />

          <Route path='/privacy-policy' element={<Privacy />} />

          <Route path='/terms-condition' element={<Terms />} />

          <Route path='/contact-us' element={<Contact />} />

        </Routes>
      </main>
      {
        !hideHeaderFooterRoutes.includes(location.pathname)
        &&
        <Footer />
      }

    </div >

  );
}

export default function App() {

  return <Layout />;
}