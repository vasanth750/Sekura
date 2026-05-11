import { Routes, Route } from 'react-router-dom';

import Signup from './Pages/Signup.jsx';
import Login from './Pages/Login.jsx';
import footer from './components/footer/footer.jsx';


function App() {
  return (
    <>
    <div>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/Signup" element={<Signup />} />

      </Routes>
      <footer />
    </div>
    
    </>
  );
}

export default App;