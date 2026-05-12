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

function Layout() {
  const location = useLocation();

  const hideHeaderFooterRouts = ['/login', '/signup'];

  return (
    <>
      {!hideHeaderFooterRouts.includes(location.pathname) && <Header />}

      <Routes>

        <Route path='/' element={<Navigate to="/login" />} />

        <Route path='/login' element={<Login />} />

        <Route path='/signup' element={<Signup />} />

        <Route path='/secrets' element={<Secrets />} />


      </Routes>

      {!hideHeaderFooterRouts.includes(location.pathname) && <Footer />}
    </>
  );
}

export default function App() {

  return (
    <>
      <Layout />
    </>
  );

}