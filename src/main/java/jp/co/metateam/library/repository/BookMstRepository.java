package jp.co.metateam.library.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import jp.co.metateam.library.model.BookMst;

import java.math.BigInteger;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;

public interface BookMstRepository extends JpaRepository<BookMst, Long> {
	List<BookMst> findAll();

	Optional<BookMst> findById(BigInteger id);

//リスト 

@Query("SELECT bm " + 
        "FROM BookMst bm " + 
        "WHERE deletedAt IS null") 
  List<BookMst> bookTitle(); 
}
