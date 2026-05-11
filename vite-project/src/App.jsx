import { Routes, Route } from 'react-router-dom';

import Signup from './Pages/Signup.jsx';
import Login from './Pages/Login.jsx';
import Footer from './components/footer/Footer.jsx';


function App() {
  return (
    <>
    <div>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/Signup" element={<Signup />} />

      </Routes>
      
      <Footer />
    </div>
    
    </>
  );
}

export default App;