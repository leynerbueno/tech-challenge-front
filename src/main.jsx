import 'bootstrap/dist/css/bootstrap.min.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CurrentOrderss from './pages/CurrentOrders/CurrentOrders.jsx';
import LoginAttendant from './pages/Attendant/Login/LoginAttendant.jsx';
import AttendantMenu from './pages/Attendant/Menu/AttendantMenu.jsx';
import AttendantDashboard from './pages/Attendant/Dashboard/AttendantDashboard.jsx';
import OrderDashboard from './pages/Order/Dashboard/OrderDashboard.jsx';
import ProductDashboard from './pages/Products/ProductsDashboard.jsx';
import LoginCustomer from './pages/Customer/Login/LoginCustomer.jsx';
import CreateCustomer from './pages/Customer/CreateCustomer/CreateCustomer.jsx';
import CreateAnonymousCustomer from './pages/Customer/CreateCustomer/CreateAnonymousCustomer.jsx';
import CreateOrder from './pages/Order/CreateOrder/CreateOrder.jsx';


createRoot(document.getElementById('root')).render(

  <BrowserRouter>
    <Routes>
      <Route path="/current-orders" element={<CurrentOrderss />} />
      <Route path="/login-attendant" element={<LoginAttendant />} />
      <Route path="/attendant-menu" element={<AttendantMenu />} />
      <Route path="/orders" element={<OrderDashboard />} />
      <Route path="/attendants" element={<AttendantDashboard />} />
      <Route path="/products" element={<ProductDashboard />} />
      <Route path="/login-customer" element={<LoginCustomer />} />
      <Route path="/create-new-customer" element={<CreateCustomer />} />
      <Route path="/create-new-anonymous-customer" element={<CreateAnonymousCustomer />} />
      <Route path="/create-order" element={<CreateOrder />} />
    </Routes>
  </BrowserRouter>
)