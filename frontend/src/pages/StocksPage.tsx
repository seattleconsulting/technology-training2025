import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch, extractErrorMessages } from '../api/client';
import {
  BookListItem,
  StockDetail,
  StockSummary,
  StockStatusInfo
} from '../types';

const STOCK_STATUS_OPTIONS: StockStatusInfo[] = [
  { value: 0, label: '利用可' },
  { value: 1, label: '利用不可' }
];

export const StocksPage: React.FC = () => {
  const [stocks, setStocks] = useState<StockSummary[]>([]);
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formId, setFormId] = useState('');
  const [formBookId, setFormBookId] = useState<number | null>(null);
  const [formStatus, setFormStatus] = useState<number>(0);
  const [formPrice, setFormPrice] = useState<number>(0);

  const isEditing = useMemo(() => Boolean(selectedStock && selectedId), [
    selectedId,
    selectedStock
  ]);

  const clearSelection = () => {
    setSelectedId(null);
    setSelectedStock(null);
  };

  const loadStocks = async (focusId?: string | null, reopenModal = false) => {
    setLoading(true);
    setErrors([]);
    try {
      const [list, booksResponse] = await Promise.all([
        apiFetch<StockSummary[]>('/stocks', { method: 'GET' }),
        apiFetch<BookListItem[]>('/books', { method: 'GET' })
      ]);
      setStocks(list);
      setBooks(booksResponse);
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
    loadStocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocks]);

  const resetForm = () => {
    setFormId('');
    setFormBookId(null);
    setFormStatus(0);
    setFormPrice(0);
    setFormErrors([]);
  };

  const handleSelect = async (id: string, openModal = true) => {
    setSelectedId(id);
    setDetailLoading(true);
    setErrors([]);
    try {
      const detail = await apiFetch<StockDetail>(`/stocks/${id}`, {
        method: 'GET'
      });
      setSelectedStock(detail);
      setFormId(detail.id);
      setFormBookId(detail.book?.id ?? null);
      setFormStatus(detail.statusInfo.value);
      setFormPrice(detail.price);
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
    setSelectedStock(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    resetForm();
    if (selectedId && !selectedStock) {
      setSelectedId(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormErrors([]);
    setSuccess(null);
    setSaving(true);

    if (!formBookId) {
      setFormErrors(['書籍を選択してください']);
      setSaving(false);
      return;
    }

    try {
      if (isEditing && selectedId) {
        await apiFetch<StockDetail>(`/stocks/${selectedId}`, {
          method: 'PUT',
          body: JSON.stringify({
            id: selectedId,
            bookId: formBookId,
            status: formStatus,
            price: formPrice
          })
        });
        setSuccess('在庫情報を更新しました');
      } else {
        await apiFetch<StockDetail>('/stocks', {
          method: 'POST',
          body: JSON.stringify({
            id: formId,
            bookId: formBookId,
            status: formStatus,
            price: formPrice
          })
        });
        setSuccess('在庫を登録しました');
      }
      const focusId =
        isEditing && selectedId ? selectedId : !isEditing ? null : undefined;
      await loadStocks(focusId, false);
      if (!isEditing) {
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
        <h1>在庫管理</h1>
        <p>在庫を登録し、最新の貸出状況を確認します。</p>
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
            <h2>在庫一覧</h2>
            <div className="card__actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => loadStocks(selectedId ?? undefined, false)}
                disabled={loading}
              >
                {loading ? '更新中...' : '再読み込み'}
              </button>
              <button
                type="button"
                className="button button--primary"
                onClick={openCreateModal}
              >
                在庫を登録
              </button>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>在庫lD</th>
                  <th>書籍名</th>
                  <th>ステータス</th>
                  <th>価格</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr
                    key={stock.id}
                    className={selectedId === stock.id ? 'table__row--active' : ''}
                    onClick={() => handleSelect(stock.id)}
                  >
                    <td>{stock.id}</td>
                    <td>{stock.book?.title ?? '未設定'}</td>
                    <td>{stock.statusInfo.label}</td>
                    <td>{stock.price.toLocaleString()} 円</td>
                  </tr>
                ))}
                {stocks.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="table__empty">
                      表示できる在庫がありません。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {selectedStock && (
            <div className="detail">
              <h3>貸出状況</h3>
              {detailLoading ? (
                <p>読み込み中...</p>
              ) : selectedStock.rentals.length === 0 ? (
                <p>現在、関連する貸出はありません。</p>
              ) : (
                <ul className="detail__list">
                  {selectedStock.rentals.map((rental) => (
                    <li key={rental.id}>
                      <span>利用者: {rental.employeeName ?? '不明'}</span>
                      <span>
                        期間: {rental.expectedRentalOn ?? '-'} ~{' '}
                        {rental.expectedReturnOn ?? '-'}
                      </span>
                      <span>ステータス: {rental.status.label}</span>
                    </li>
                  ))}
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
            aria-labelledby="stock-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal__header">
              <div>
                <p className="modal__label">
                  {isEditing ? '在庫の編集' : '新規登録'}
                </p>
                <h2 id="stock-modal-title">
                  {isEditing ? '在庫情報を更新' : '新しい在庫を登録'}
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
                在庫管理番号<span className="form__required">必須</span>
                <input
                  className="form__input"
                  value={formId}
                  onChange={(event) => setFormId(event.target.value)}
                  required
                  disabled={isEditing}
                />
              </label>
              <label className="form__label">
                書籍<span className="form__required">必須</span>
                <select
                  className="form__input"
                  value={formBookId ?? ''}
                  onChange={(event) =>
                    setFormBookId(
                      event.target.value ? Number(event.target.value) : null
                    )
                  }
                  required
                >
                  <option value="">選択してください</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form__label">
                在庫ステータス
                <select
                  className="form__input"
                  value={formStatus}
                  onChange={(event) => setFormStatus(Number(event.target.value))}
                >
                  {STOCK_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form__label">
                購入金額（円）
                <input
                  className="form__input"
                  type="number"
                  min={0}
                  value={formPrice}
                  onChange={(event) => setFormPrice(Number(event.target.value))}
                  required
                />
              </label>
              <div className="form__actions">
                <button
                  type="submit"
                  className="button button--primary"
                  disabled={saving}
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
