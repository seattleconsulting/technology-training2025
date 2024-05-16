package jp.co.metateam.library.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jp.co.metateam.library.model.RentalManage;
import org.springframework.data.jpa.repository.Query;
import java.util.Date;

@Repository
public interface RentalManageRepository extends JpaRepository<RentalManage, Long> {
  List<RentalManage> findAll();

  Optional<RentalManage> findById(Long id);

  // SQL文記入（貸出待ち・貸出中を自身の予定日との比較）→サービスで使える（チェックする）→その結果controllerで呼び出し

  @Query("SELECT COUNT(rm) FROM RentalManage rm " +
      "WHERE (rm.status = 0 OR rm.status = 1) " +
      "AND rm.id <> ?1 " +
      "AND rm.stock.id = ?2")
  Long countByStatusAndNotId(Long id, String stockId);

  @Query(("SELECT COUNT(rm) FROM RentalManage rm " +
      "WHERE rm.stock.id = ?4 " +
      "AND rm.status IN (0, 1) " +
      "AND rm.id <> ?3 " +
      "AND (rm.expectedReturnOn < ?1 OR ?2 < rm.expectedRentalOn)"))
  Long countByStatusAndExpectedReturnBeforeAndNotId(Date expectedRentalOn, Date expectedReturnOn, Long id,
      String stockId);

  @Query("SELECT COUNT(rm) FROM RentalManage rm " +
      "WHERE (rm.status = 0 OR rm.status = 1) " +
      "AND rm.stock.id = ?1")
  Long countByStatusAndNotIdAdd(String stockId);

  @Query(("SELECT COUNT(rm) FROM RentalManage rm " +
      "WHERE rm.stock.id = ?3 " +
      "AND rm.status IN (0, 1) " +
      "AND (rm.expectedReturnOn < ?1 OR ?2 < rm.expectedRentalOn)"))
  Long countByStatusAndExpectedReturnBeforeAndNotIdAdd(Date expectedRentalOn, Date expectedReturnOn, String stockId);
}