import { useState, useMemo } from 'react';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function toDate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface CalendarPickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate: string;
  availableDates?: Set<string>;
}

export default function CalendarPicker({ value, onChange, minDate, availableDates }: CalendarPickerProps) {
  const today = new Date();
  const min = toDate(minDate);
  const selected = value ? toDate(value) : null;

  const [viewMonth, setViewMonth] = useState(() =>
    selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const canGoNext = viewMonth.getFullYear() < today.getFullYear() + 2;

  const grid = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startPad = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const cells: { day: number; date: Date; type: 'prev' | 'current' | 'next' }[] = [];

    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrev - i);
      cells.push({ day: daysInPrev - i, date: d, type: 'prev' });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, date: new Date(year, month, i), type: 'current' });
    }

    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, date: new Date(year, month + 1, i), type: 'next' });
    }

    return cells;
  }, [viewMonth]);

  const isDisabled = (date: Date) => date < min;

  const isSelected = (date: Date) => selected && isSameDay(date, selected);

  const isToday = (date: Date) => isSameDay(date, today);

  const hasAvailability = (date: Date) => availableDates && availableDates.has(toStr(date));

  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));

  const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  return (
    <div className="calendar-picker">
      <div className="calendar-header">
        <button type="button" className="calendar-nav" onClick={prevMonth} aria-label="Mes anterior">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="calendar-title">
          {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </span>
        <button type="button" className="calendar-nav" onClick={nextMonth} disabled={!canGoNext} aria-label="Mes siguiente">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="calendar-days">
        {DAYS.map(d => (
          <div key={d} className="calendar-day-label">{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {grid.map((cell, i) => {
          const disabled = cell.type !== 'current' || isDisabled(cell.date);
          const selected = isSelected(cell.date);
          const today = isToday(cell.date);
          const avail = hasAvailability(cell.date);

          return (
            <button
              key={i}
              type="button"
              className={`calendar-cell ${cell.type} ${disabled ? 'disabled' : ''} ${selected ? 'selected' : ''} ${today && !selected ? 'today' : ''}`}
              disabled={disabled}
              onClick={() => { if (!disabled) onChange(toStr(cell.date)); }}
            >
              <span className="calendar-cell-day">{cell.day}</span>
              {avail && <span className="calendar-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
