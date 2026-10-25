import { useMemo } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface CalendarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  minMonth: Date;
  maxMonth: Date;
  selected: Date | null;
  onSelect: (date: Date) => void;
  isAvailable: (date: Date) => boolean;
  loading?: boolean;
}

export function Calendar({ month, onMonthChange, minMonth, maxMonth, selected, onSelect, isAvailable, loading }: CalendarProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const today = new Date();
  const canPrev = startOfMonth(month) > startOfMonth(minMonth);
  const canNext = startOfMonth(month) < startOfMonth(maxMonth);

  return (
    <div className={`calendar ${loading ? 'is-loading' : ''}`}>
      <div className="calendar-head">
        <h3>{format(month, 'MMMM yyyy')}</h3>
        <div className="calendar-nav">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon"
            onClick={() => onMonthChange(addMonths(month, -1))}
            disabled={!canPrev}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon"
            onClick={() => onMonthChange(addMonths(month, 1))}
            disabled={!canNext}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="calendar-grid" role="grid" aria-label={format(month, 'MMMM yyyy')}>
        {WEEK_LABELS.map((label) => (
          <span key={label} className="calendar-weekday" role="columnheader">
            {label}
          </span>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const available = inMonth && !loading && isAvailable(day);
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isToday = isSameDay(day, today);
          return (
            <button
              key={day.getTime()}
              type="button"
              role="gridcell"
              className={[
                'calendar-day',
                !inMonth && 'is-outside',
                available && 'is-available',
                isSelected && 'is-selected',
                isToday && 'is-today',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={!available}
              aria-pressed={isSelected}
              aria-label={format(day, 'EEEE d MMMM yyyy') + (available ? '' : ', unavailable')}
              onClick={() => onSelect(day)}
            >
              {inMonth ? format(day, 'd') : ''}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span>
          <i className="dot dot-available" /> Available
        </span>
        <span>
          <i className="dot dot-selected" /> Selected
        </span>
      </div>
    </div>
  );
}
