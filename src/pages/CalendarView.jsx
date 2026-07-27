"use client";
import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './CalendarView.css';

const CalendarView = () => {
  const { transactions } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Real data for days
  const getDayData = (day) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    let income = 0;
    let expenses = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date).toDateString();
      if (tDate === targetDate) {
        if (t.type === 'income') income += t.amount;
        if (t.type === 'expense') expenses += t.amount;
      }
    });

    return { income, expenses };
  };

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const data = getDayData(i);
      const hasActivity = data.income > 0 || data.expenses > 0;
      
      days.push(
        <div key={i} className={`calendar-day ${hasActivity ? 'has-activity' : ''} glass-panel`}>
          <span className="day-number">{i}</span>
          {hasActivity && (
            <div className="day-data">
              {data.income > 0 && <div className="text-success text-xs">+₹{data.income.toLocaleString('en-IN')}</div>}
              {data.expenses > 0 && <div className="text-danger text-xs">-₹{data.expenses.toLocaleString('en-IN')}</div>}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header glass-panel">
        <button onClick={prevMonth} className="icon-btn"><ChevronLeft /></button>
        <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button onClick={nextMonth} className="icon-btn"><ChevronRight /></button>
      </div>

      <div className="calendar-grid-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="grid-header-day">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default CalendarView;
