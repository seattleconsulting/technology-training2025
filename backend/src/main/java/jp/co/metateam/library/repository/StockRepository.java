package jp.co.metateam.library.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jp.co.metateam.library.model.Stock;

import java.sql.Date;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

  List<Stock> findAll();

  List<Stock> findByDeletedAtIsNull();

  List<Stock> findByDeletedAtIsNullAndStatus(Integer status);

  Optional<Stock> findById(String id);

  List<Stock> findByBookMstIdAndStatus(Long book_id, Integer status);

  // 書籍ごとの総利用可能在庫取得→①ループの中でセットしていく②カウントして日付ごとの在庫数を表示させる際に使用
  // リスト

  @Query("SELECT s " +
      "FROM Stock s " +
      "WHERE s.status = 0 " +
      "AND s.bookMst.title = ?1 " +
      "AND deletedAt IS null")
  List<Stock> bookStockAvailable(String title);

  // 日付ごとの在庫数を表示させる際に使用（貸出待ち）

  @Query("SELECT COUNT (rm) " +
      "FROM RentalManage rm " +
      "LEFT OUTER JOIN Stock s ON rm.stock.id = s.id " +
      "WHERE NOT(rm.expectedRentalOn > ?1 " +
      "OR rm.expectedReturnOn < ?1) " +
      "AND s.bookMst.id = ?2 " +
      "AND s.status = 0 " +
      "AND rm.status = 0 " +
      "AND deletedAt IS null")
  int borrowingWaitBook(Date day, Long id);

  // 日付ごとの在庫数を表示させる際に使用（貸出中）

  @Query(value ="SELECT Count(*) " +
      "FROM rental_manage rm " +
      "LEFT OUTER JOIN stocks s ON rm.stock_id = s.id " +
      "WHERE NOT(CAST(rm.rentaled_at as date) > :date " +
      "OR rm.expected_return_on < :date) " +
      "AND s.book_id = :book_id " +
      "AND s.status = 0 " +
      "AND rm.status = 1 " +
      "AND deleted_at IS null",nativeQuery = true)
   int borrowingBook(Date date, Long book_id);

  // 日付ごとの貸出不可の在庫管理番号取得
  // リスト

  @Query("SELECT DISTINCT s " +
      "FROM Stock s " +
      "LEFT OUTER JOIN RentalManage rm ON s.id = rm.stock.id " +
      "WHERE ?1 BETWEEN rm.expectedRentalOn AND rm.expectedReturnOn " +
      "AND s.bookMst.title = ?2 " +
      "AND s.status = 0 " +
      "AND deletedAt IS null")
  List<Stock> lendableBook(Date choiceDate, String title);

}
