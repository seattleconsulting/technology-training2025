import { FormEvent, useEffect, useState } from 'react';
import { apiFetch, extractErrorMessages } from '../api/client';
import { BookDetail, BookListItem } from '../types';

export const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageErrors, setPageErrors] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadBooks = async () => {
    setLoading(true);
    setPageErrors([]);
    try {
      const data = await apiFetch<BookListItem[]>('/books', { method: 'GET' });
      setBooks(data);
    } catch (error) {
      setPageErrors(extractErrorMessages(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const resetForm = () => {
    setTitle('');
    setIsbn('');
    setEditingId(null);
    setFormErrors([]);
  };

  const openCreateModal = () => {
    resetForm();
    setSuccess(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormErrors([]);
    setSuccess(null);
    setSaving(true);
    try {
      if (editingId) {
        await apiFetch<BookDetail>(`/books/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ title, isbn })
        });
        setSuccess('書籍情報を更新しました');
      } else {
        await apiFetch<BookDetail>('/books', {
          method: 'POST',
          body: JSON.stringify({ title, isbn })
        });
        setSuccess('書籍を登録しました');
      }
      resetForm();
      await loadBooks();
      closeModal();
    } catch (error) {
      setFormErrors(extractErrorMessages(error));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (book: BookListItem) => {
    setEditingId(book.id);
    setTitle(book.title);
    setIsbn(book.isbn);
    setSuccess(null);
    setFormErrors([]);
    setIsModalOpen(true);
  };

  return (
    <div className="page">
      <div className="page__header">
        <h1>書籍一覧</h1>
        <p>既存の書籍を確認し、登録・更新が行えます。</p>
      </div>
      {pageErrors.length > 0 && (
        <div className="alert alert--error">
          {pageErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}
      {success && <div className="alert alert--success">{success}</div>}
      <section className="card">
        <div className="card__header">
          <div>
            <h2>登録済みの書籍</h2>
            <p className="muted">在庫数を参考にしながら詳細を確認できます。</p>
          </div>
          <div className="card__actions">
            <button
              type="button"
              className="button button--ghost"
              onClick={loadBooks}
              disabled={loading}
            >
              {loading ? '更新中...' : '再読み込み'}
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={openCreateModal}
            >
              新しい書籍を登録
            </button>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>書籍名</th>
                <th>ISBN</th>
                <th>利用可能在庫</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.isbn}</td>
                  <td>{book.availableStockCount} 冊</td>
                  <td>
                    <button
                      className="link-button"
                      type="button"
                      onClick={() => handleEdit(book)}
                    >
                      編集
                    </button>
                  </td>
                </tr>
              ))}
              {books.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="table__empty">
                    登録されている書籍がありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeModal}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal__header">
              <div>
                <p className="modal__label">
                  {editingId ? '書籍の編集' : '新規登録'}
                </p>
                <h2 id="book-modal-title">
                  {editingId ? '書籍情報を更新' : '新しい書籍を登録'}
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
                書籍名<span className="form__required">必須</span>
                <input
                  className="form__input"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  required
                />
              </label>
              <label className="form__label">
                ISBN<span className="form__required">必須</span>
                <input
                  className="form__input"
                  value={isbn}
                  onChange={(event) => setIsbn(event.target.value)}
                  required
                  pattern="^[0-9]{13}$"
                  placeholder="数字13桁"
                />
              </label>
              <div className="form__actions">
                <button
                  type="submit"
                  className="button button--primary"
                  disabled={saving}
                >
                  {saving ? '保存中...' : editingId ? '更新する' : '登録する'}
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
