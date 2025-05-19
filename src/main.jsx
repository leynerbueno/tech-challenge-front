import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CurrentOrderss from './pages/CurrentOrders/CurrentOrders.jsx';
import Login from "./pages/Login/Login.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';


createRoot(document.getElementById('root')).render(

  <BrowserRouter>
    <Routes>
      <Route path="/current-orders" element={<CurrentOrderss />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </BrowserRouter>
)



