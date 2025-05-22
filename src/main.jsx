import 'bootstrap/dist/css/bootstrap.min.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CurrentOrderss from './pages/CurrentOrders/CurrentOrders.jsx';
import LoginAttendant from './pages/Attendant/Login/LoginAttendant.jsx';
import Dashboard from './pages/Attendant/Dashboard/Dashboard.jsx';
import ProductDashboard from './pages/Products/ProductsDashboard.jsx';
import LoginCustomer from './pages/Customer/Login/LoginCustomer.jsx';
import CreateCustomer from './pages/Customer/CreateCustomer/CreateCustomer.jsx';
import CreateOrder from './pages/Order/CreateOrder/CreateOrder.jsx';


createRoot(document.getElementById('root')).render(

  <BrowserRouter>
    <Routes>
      <Route path="/current-orders" element={<CurrentOrderss />} />
      <Route path="/login-attendant" element={<LoginAttendant />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<ProductDashboard />} />
      <Route path="/login-customer" element={<LoginCustomer />} />
      <Route path="/create-new-customer" element={<CreateCustomer />} />
      <Route path="/create-order" element={<CreateOrder />} />
    </Routes>
  </BrowserRouter>
)