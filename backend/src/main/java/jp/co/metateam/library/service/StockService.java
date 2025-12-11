package jp.co.metateam.library.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jp.co.metateam.library.constants.Constants;
import jp.co.metateam.library.model.BookMst;
import jp.co.metateam.library.model.RentalManage;
import jp.co.metateam.library.model.Stock;
import jp.co.metateam.library.model.StockDto;
import jp.co.metateam.library.repository.BookMstRepository;
import jp.co.metateam.library.repository.StockRepository;

import java.sql.Date;

@Service
public class StockService {
    private final BookMstRepository bookMstRepository;
    private final StockRepository stockRepository;

    @Autowired
    public StockService(BookMstRepository bookMstRepository, StockRepository stockRepository) {
        this.bookMstRepository = bookMstRepository;
        this.stockRepository = stockRepository;
    }

    public List<Stock> findAll() {
        List<Stock> stocks = this.stockRepository.findByDeletedAtIsNull();

        return stocks;
    }

    public List<Stock> findStockAvailableAll() {
        List<Stock> stocks = this.stockRepository.findByDeletedAtIsNullAndStatus(Constants.STOCK_AVAILABLE);

        return stocks;
    }

    public Stock findById(String id) {
        return this.stockRepository.findById(id).orElse(null);
    }

    // 在庫カレンダーデータ取得
    // 書籍名取得
    public List<BookMst> bookTitle() {
        return this.bookMstRepository.bookTitle();
    }

    // 書籍ごと総利用可能在庫取得
    public List<Stock> bookStockAvailable(String title) {
        return this.stockRepository.bookStockAvailable(title);
    }

    // 書籍ごと利用不可能在庫数取得（貸出待ち）
    public int borrowingWaitBook(Date day, Long id) {
        return this.stockRepository.borrowingWaitBook(day, id);
    }

    // 書籍ごと利用不可能在庫数取得（貸出中）
    public int borrowingBook(Date day, Long bookId) {
        return this.stockRepository.borrowingBook(day, bookId);
    }

    // 書籍ごと利用可能在庫番号取得
    public List<Stock> lendableBook(Date choiceDate, String title) {
        return this.stockRepository.lendableBook(choiceDate, title);
    }

    public void save(StockDto stockDto) throws Exception {
        try {
            Stock stock = new Stock();
            BookMst bookMst = this.bookMstRepository.findById(stockDto.getBookId()).orElse(null);
            if (bookMst == null) {
                throw new Exception("BookMst record not found.");
            }

            stock.setBookMst(bookMst);
            stock.setId(stockDto.getId());
            stock.setStatus(stockDto.getStatus());
            stock.setPrice(stockDto.getPrice());

            // データベースへの保存
            this.stockRepository.save(stock);
        } catch (Exception e) {
            throw e;
        }
    }

    public void update(String id, StockDto stockDto) throws Exception {
        try {
            Stock stock = findById(id);
            if (stock == null) {
                throw new Exception("Stock record not found.");
            }

            BookMst bookMst = stock.getBookMst();
            if (bookMst == null) {
                throw new Exception("BookMst record not found.");
            }

            stock.setId(stockDto.getId());
            stock.setBookMst(bookMst);
            stock.setStatus(stockDto.getStatus());
            stock.setPrice(stockDto.getPrice());

            // データベースへの保存
            this.stockRepository.save(stock);
        } catch (Exception e) {
            throw e;
        }
    }

    public List<Object> generateDaysOfWeek(int year, int month, LocalDate startDate, int daysInMonth) {
        List<Object> daysOfWeek = new ArrayList<>();
        for (int dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth++) {
            LocalDate date = LocalDate.of(year, month, dayOfMonth);
            DateTimeFormatter formmater = DateTimeFormatter.ofPattern("dd(E)", Locale.JAPANESE);
            daysOfWeek.add(date.format(formmater));
        }

        return daysOfWeek;
    }

    public List<List<String>> generateValues(Integer year, Integer month, Integer daysInMonth) {
        // データの取得
        List<BookMst> bookTitleIds = this.bookTitle();
        int titleCount = bookTitleIds.size();
        List<String> titleArray = new ArrayList<>();
        List<Long> idArray = new ArrayList<>();
        List<String> availableArray = new ArrayList<>();
        List<String> dayStockArray = new ArrayList<>();

        for (BookMst bookList : bookTitleIds) {
            titleArray.add(bookList.getTitle());
            idArray.add(bookList.getId());

            List<Stock> StockAvailable = this.bookStockAvailable(bookList.getTitle());
            // List<Stock> StockId = StockAvailable.getId();
            int stockCount = StockAvailable.size();
            String stockCountString = String.valueOf(stockCount);
            availableArray.add(stockCountString);

            for (int dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth++) {
                LocalDate localDate = LocalDate.of(year, month, dayOfMonth);
                java.sql.Date day = java.sql.Date.valueOf(localDate);

                int borrowingWaitBook = this.borrowingWaitBook(day, bookList.getId());
                int borrowingBook = this.borrowingBook(day, bookList.getId());
                int dayStockCount = stockCount - (borrowingWaitBook + borrowingBook);
                String dayStockCountString = String.valueOf(dayStockCount);

                if (dayStockCountString.equals("0")) {
                    dayStockCountString = "×";
                }

                dayStockArray.add(dayStockCountString);
            }
        }

        List<List<String>> bigValues = new ArrayList<>();

        int roopCount = 0;

        for (int i = 0; i < titleCount; i++) {
            List<String> values = new ArrayList<>();

            values.add(titleArray.get(i)); // 対象の書籍名
            values.add(availableArray.get(i)); // 対象書籍の在庫総数

            for (int j = 1; j <= daysInMonth; j++) {
                values.add(dayStockArray.get(roopCount));
                roopCount++;
            }
            bigValues.add(values);
        }
        return bigValues;
    }

    // 貸出登録画面に遷移する際に在庫管理番号を渡すメソッド
    public List<Stock> availableStockValues(java.sql.Date choiceDate, String title) {

        List<Stock> availableList = lendableBook(choiceDate, title);
        List<Stock> StockAvailable = this.bookStockAvailable(title);

        StockAvailable.removeAll(availableList);

        return StockAvailable;
    }

}
