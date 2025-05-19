import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CurrentOrderss from './pages/CurrentOrders/CurrentOrders.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';


createRoot(document.getElementById('root')).render(

  <BrowserRouter>
    <Routes>
      <Route path="/current-orders" element={<CurrentOrderss />} />
    </Routes>
  </BrowserRouter>
)



