import { BrowserRouter,Routes,Route} from 'react-router-dom';
import React from 'react';
import Globeview from './Pages/Globeview';
import Home from './Pages/Home';
import AdminLogin from './Pages/Adminlogin';
import Admindashboard from './Pages/Admindashboard';

function App() {
  return (
    <div>
        <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/globeview" element={<Globeview />} />
            <Route path="/adminlogin" element={<AdminLogin />} />
<Route path="/admindashboard-backend" element={<Admindashboard />} />
    </Routes>            

    </BrowserRouter>
    </div>
  );
}

export default App;