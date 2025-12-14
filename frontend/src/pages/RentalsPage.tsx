import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, extractErrorMessages } from '../api/client';
import {
  AccountOption,
  RentalDetail,
  RentalSummary,
  RentalStatusInfo,
  StockOption
} from '../types';

const RENTAL_STATUS_OPTIONS: RentalStatusInfo[] = [
  { value: 0, label: '貸出待ち' },
  { value: 1, label: '貸出中' },
  { value: 2, label: '返却済み' },
  { value: 3, label: 'キャンセル' }
];

export const RentalsPage: React.FC = () => {
  const [rentals, setRentals] = useState<RentalSummary[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [stocks, setStocks] = useState<StockOption[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedRental, setSelectedRental] = useState<RentalDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formStockId, setFormStockId] = useState('');
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formStatus, setFormStatus] = useState(0);
  const [formRentalOn, setFormRentalOn] = useState('');
  const [formReturnOn, setFormReturnOn] = useState('');

  const isEditing = useMemo(() => selectedId !== null, [selectedId]);

  const loadRentals = async (
    focusId?: number | null,
    reopenModal = false
  ) => {
    setLoading(true);
    setErrors([]);
    try {
      const [list, accountOptions, stockOptions] = await Promise.all([
        apiFetch<RentalSummary[]>('/rentals', { method: 'GET' }),
        apiFetch<AccountOption[]>('/rentals/options/accounts', { method: 'GET' }),
        apiFetch<StockOption[]>('/rentals/options/stocks', { method: 'GET' })
      ]);
      setRentals(list);
      setAccounts(accountOptions);
      setStocks(stockOptions);
      if (typeof focusId !== 'undefined') {
        if (focusId === null) {
          clearSelection();
        } else {
          await handleSelect(focusId, reopenModal);
        }
      }
    } catch (error) {
      setErrors(extractErrorMessages(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearSelection = () => {
    setSelectedId(null);
    setSelectedRental(null);
    resetForm();
  };

  const resetForm = () => {
    setFormStockId('');
    setFormEmployeeId('');
    setFormStatus(0);
    setFormRentalOn('');
    setFormReturnOn('');
    setFormErrors([]);
  };

  const handleSelect = async (id: number, openModal = true) => {
    setSelectedId(id);
    setDetailLoading(true);
    setErrors([]);
    try {
      const detail = await apiFetch<RentalDetail>(`/rentals/${id}`, {
        method: 'GET'
      });
      setSelectedRental(detail);
      setFormStockId(detail.stock?.id ?? detail.stockId ?? '');
      setFormEmployeeId(detail.account?.employeeId ?? detail.employeeId ?? '');
      setFormStatus(detail.status.value);
      setFormRentalOn(detail.expectedRentalOn ?? '');
      setFormReturnOn(detail.expectedReturnOn ?? '');
      setFormErrors([]);
      if (openModal) {
        setIsModalOpen(true);
      }
    } catch (error) {
      setErrors(extractErrorMessages(error));
    } finally {
      setDetailLoading(false);
    }
  };

  const openCreateModal = () => {
    setSuccess(null);
    resetForm();
    setSelectedId(null);
    setSelectedRental(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    resetForm();
    if (!isEditing) {
      setSelectedId(null);
      setSelectedRental(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormErrors([]);
    setSuccess(null);
    setSaving(true);

    try {
      if (isEditing && selectedId !== null) {
        await apiFetch<RentalDetail>(`/rentals/${selectedId}`, {
          method: 'PUT',
          body: JSON.stringify({
            stockId: formStockId,
            employeeId: formEmployeeId,
            status: formStatus,
            expectedRentalOn: formRentalOn,
            expectedReturnOn: formReturnOn
          })
        });
        setSuccess('貸出情報を更新しました');
        await loadRentals(selectedId, false);
      } else {
        await apiFetch<RentalDetail>('/rentals', {
          method: 'POST',
          body: JSON.stringify({
            stockId: formStockId,
            employeeId: formEmployeeId,
            status: formStatus,
            expectedRentalOn: formRentalOn,
            expectedReturnOn: formReturnOn
          })
        });
        setSuccess('貸出を登録しました');
        loadRentals(undefined, false);
        resetForm();
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormErrors(extractErrorMessages(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1>貸出管理</h1>
        <p>貸出状況を管理し、新規貸出の登録を行います。</p>
      </div>
      {errors.length > 0 && (
        <div className="alert alert--error">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}
      {success && <div className="alert alert--success">{success}</div>}
      <div className="page__grid">
        <section className="card">
          <div className="card__header">
            <h2>貸出一覧</h2>
            <div className="card__actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => loadRentals(selectedId ?? undefined, false)}
                disabled={loading}
              >
                {loading ? '更新中...' : '再読み込み'}
              </button>
              <button
                type="button"
                className="button button--primary"
                onClick={openCreateModal}
              >
                新しい貸出を登録
              </button>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>在庫番号</th>
                  <th>利用者</th>
                  <th>貸出期間</th>
                  <th>ステータス</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((rental) => (
                  <tr
                    key={rental.id}
                    className={
                      selectedId === rental.id ? 'table__row--active' : ''
                    }
                    onClick={() => handleSelect(rental.id)}
                  >
                    <td>{rental.id}</td>
                    <td>{rental.stockId ?? '-'}</td>
                    <td>
                      {rental.employeeName ?? '-'}
                      {rental.employeeId ? `（${rental.employeeId}）` : ''}
                    </td>
                    <td>
                      {rental.expectedRentalOn ?? '-'} ~{' '}
                      {rental.expectedReturnOn ?? '-'}
                    </td>
                    <td>{rental.status.label}</td>
                  </tr>
                ))}
                {rentals.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="table__empty">
                      貸出情報がありません。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {selectedRental && (
            <div className="detail">
              <h3>詳細</h3>
              {detailLoading ? (
                <p>読み込み中...</p>
              ) : (
                <ul className="detail__list">
                  <li>
                    <span>在庫番号</span>
                    <span>{selectedRental.stock?.id ?? '-'}</span>
                  </li>
                  <li>
                    <span>利用者</span>
                    <span>
                      {selectedRental.account?.name ?? '-'}
                      {selectedRental.account
                        ? `（${selectedRental.account.employeeId}）`
                        : ''}
                    </span>
                  </li>
                  <li>
                    <span>貸出状況</span>
                    <span>{selectedRental.status.label}</span>
                  </li>
                  <li>
                    <span>貸出予定日</span>
                    <span>{selectedRental.expectedRentalOn ?? '-'}</span>
                  </li>
                  <li>
                    <span>返却予定日</span>
                    <span>{selectedRental.expectedReturnOn ?? '-'}</span>
                  </li>
                  <li>
                    <span>貸出日</span>
                    <span>{selectedRental.rentaledAt ?? '-'}</span>
                  </li>
                  <li>
                    <span>返却日</span>
                    <span>{selectedRental.returnedAt ?? '-'}</span>
                  </li>
                  <li>
                    <span>キャンセル</span>
                    <span>{selectedRental.canceledAt ?? '-'}</span>
                  </li>
                </ul>
              )}
            </div>
          )}
        </section>
      </div>
      {isModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeModal}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rental-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal__header">
              <div>
                <p className="modal__label">
                  {isEditing ? '貸出の編集' : '新規登録'}
                </p>
                <h2 id="rental-modal-title">
                  {isEditing ? '貸出情報を更新' : '新しい貸出を登録'}
                </h2>
              </div>
              <button
                type="button"
                className="button button--ghost button--icon modal__close"
                onClick={closeModal}
                aria-label="閉じる"
              >
                <span />
                <span />
              </button>
            </header>
            {formErrors.length > 0 && (
              <div className="alert alert--error">
                {formErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}
            <form className="form" onSubmit={handleSubmit}>
              <label className="form__label">
                在庫管理番号
                <select
                  className="form__input"
                  value={formStockId}
                  onChange={(event) => setFormStockId(event.target.value)}
                  required
                >
                  <option value="">選択してください</option>
                  {stocks.map((stock) => (
                    <option key={stock.stockId} value={stock.stockId}>
                      {stock.stockId}（{stock.title ?? 'タイトル不明'}）
                    </option>
                  ))}
                </select>
              </label>
              <label className="form__label">
                社員番号
                <select
                  className="form__input"
                  value={formEmployeeId}
                  onChange={(event) => setFormEmployeeId(event.target.value)}
                  required
                >
                  <option value="">選択してください</option>
                  {accounts.map((account) => (
                    <option key={account.employeeId} value={account.employeeId}>
                      {account.name}（{account.employeeId}）
                    </option>
                  ))}
                </select>
              </label>
              <label className="form__label">
                ステータス
                <select
                  className="form__input"
                  value={formStatus}
                  onChange={(event) => setFormStatus(Number(event.target.value))}
                >
                  {RENTAL_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form__label">
                貸出予定日
                <input
                  className="form__input"
                  type="date"
                  value={formRentalOn}
                  onChange={(event) => setFormRentalOn(event.target.value)}
                  required
                />
              </label>
              <label className="form__label">
                返却予定日
                <input
                  className="form__input"
                  type="date"
                  value={formReturnOn}
                  onChange={(event) => setFormReturnOn(event.target.value)}
                  required
                />
              </label>
              <div className="form__actions">
                <button
                  type="submit"
                  className="button button--primary"
                >
                  {saving ? '保存中...' : isEditing ? '更新する' : '登録する'}
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
