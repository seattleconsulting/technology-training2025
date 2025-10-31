import { useEffect, useState } from 'react';
import { apiFetch, extractErrorMessages } from '../api/client';
import { StockCalendarResponse } from '../types';

export const StockCalendarPage: React.FC = () => {
  const [calendar, setCalendar] = useState<StockCalendarResponse | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const fetchCalendar = async (selectedYear?: number, selectedMonth?: number) => {
    setLoading(true);
    setErrors([]);
    try {
      const params = new URLSearchParams();
      if (selectedYear) params.set('year', selectedYear.toString());
      if (selectedMonth) params.set('month', selectedMonth.toString());
      const data = await apiFetch<StockCalendarResponse>(
        `/stocks/calendar${params.toString() ? `?${params.toString()}` : ''}`,
        { method: 'GET' }
      );
      setCalendar(data);
      if (selectedYear == null) {
        setYear(data.targetYear);
      }
      if (selectedMonth == null) {
        setMonth(data.targetMonth);
      }
    } catch (error) {
      setErrors(extractErrorMessages(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const handleChange = (nextYear?: number, nextMonth?: number) => {
    fetchCalendar(nextYear ?? year ?? undefined, nextMonth ?? month ?? undefined);
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1>在庫カレンダー</h1>
        <p>日毎の空き状況を確認できます。</p>
      </div>
      {errors.length > 0 && (
        <div className="alert alert--error">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}
      {calendar && (
        <div className="card">
          <div className="calendar-controls">
            <label>
              年
              <select
                value={year ?? calendar.targetYear}
                onChange={(event) => handleChange(Number(event.target.value), month ?? undefined)}
              >
                {calendar.yearOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              月
              <select
                value={month ?? calendar.targetMonth}
                onChange={(event) =>
                  handleChange(year ?? undefined, Number(event.target.value))
                }
              >
                {calendar.monthOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => handleChange(calendar.targetYear, calendar.targetMonth)}
              disabled={loading}
            >
              {loading ? '読み込み中...' : 'リセット'}
            </button>
          </div>
          <div className="table-wrapper table-wrapper--horizontal">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>書籍名</th>
                  <th>総在庫</th>
                  {calendar.daysOfWeek.map((day, index) => (
                    <th key={index}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calendar.books.map((book) => (
                  <tr key={book.title}>
                    <td>{book.title}</td>
                    <td>{book.totalAvailable}</td>
                    {book.dailyAvailability.map((value, index) => (
                      <td key={index} className={value === '×' ? 'cell--unavailable' : ''}>
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {!calendar && !loading && (
        <p className="muted">在庫情報がまだ登録されていません。</p>
      )}
    </div>
  );
};

