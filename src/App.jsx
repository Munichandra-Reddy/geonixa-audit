import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from './context/AppContext';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import IncomeForm from './pages/IncomeForm';
import ExpenseForm from './pages/ExpenseForm';
import Employees from './pages/Employees';
import Mentors from './pages/Mentors';

function App() {
  const { isAuthenticated } = useContext(AppContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="income" element={<IncomeForm />} />
          <Route path="expenses" element={<ExpenseForm />} />
          <Route path="employees" element={<Employees />} />
          <Route path="mentors" element={<Mentors />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
