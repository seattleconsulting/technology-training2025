export interface AccountSummary {
  employeeId: string;
  name: string;
  email: string;
  authorizationType: number;
}

export interface AuthorizationType {
  code: number;
  label: string;
}

export interface BookListItem {
  id: number;
  title: string;
  isbn: string;
  availableStockCount: number;
}

export type BookDetail = BookListItem;

export interface StockStatusInfo {
  value: number;
  label: string;
}

export interface StockBookInfo {
  id: number;
  title: string;
}

export interface RentalSummary {
  id: number;
  status: RentalStatusInfo;
  expectedRentalOn: string | null;
  expectedReturnOn: string | null;
  stockId: string | null;
  employeeId: string | null;
  employeeName: string | null;
}

export interface RentalDetail extends RentalSummary {
  rentaledAt: string | null;
  returnedAt: string | null;
  canceledAt: string | null;
  stock: StockInfo | null;
  account: AccountInfo | null;
}

export interface StockSummary {
  id: string;
  status: number;
  price: number;
  statusInfo: StockStatusInfo;
  book: StockBookInfo | null;
}

export interface StockDetail extends StockSummary {
  rentals: RentalSummary[];
}

export interface StockCalendarResponse {
  targetYear: number;
  targetMonth: number;
  daysOfWeek: (string | number)[];
  daysInMonth: number;
  nowDate: string;
  books: Array<{
    title: string;
    totalAvailable: number;
    dailyAvailability: string[];
  }>;
  yearOptions: number[];
  monthOptions: number[];
}

export interface StockInfo {
  id: string;
  title: string | null;
}

export interface AccountInfo {
  employeeId: string;
  name: string;
  email: string;
}

export interface RentalStatusInfo {
  value: number;
  label: string;
}

export interface LoginResponse {
  account: AccountSummary;
  token: string;
}

export interface ErrorResponse {
  errors?: Array<{ field?: string; message: string }>;
  message?: string;
}

export interface AccountOption {
  employeeId: string;
  name: string;
}

export interface StockOption {
  stockId: string;
  title: string | null;
  status: number;
}
