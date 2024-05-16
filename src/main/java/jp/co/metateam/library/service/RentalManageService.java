package jp.co.metateam.library.service;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jp.co.metateam.library.model.Account;
import jp.co.metateam.library.model.RentalManage;
import jp.co.metateam.library.model.RentalManageDto;
import jp.co.metateam.library.model.Stock;
import jp.co.metateam.library.repository.AccountRepository;
import jp.co.metateam.library.repository.RentalManageRepository;
import jp.co.metateam.library.repository.StockRepository;
import jp.co.metateam.library.values.RentalStatus;

@Service
public class RentalManageService {

    private final AccountRepository accountRepository;
    private final RentalManageRepository rentalManageRepository;
    private final StockRepository stockRepository;

    @Autowired
    public RentalManageService(
            AccountRepository accountRepository,
            RentalManageRepository rentalManageRepository,
            StockRepository stockRepository) {
        this.accountRepository = accountRepository;
        this.rentalManageRepository = rentalManageRepository;
        this.stockRepository = stockRepository;
    }

    @Transactional
    public List<RentalManage> findAll() {
        List<RentalManage> rentalManageList = this.rentalManageRepository.findAll();

        return rentalManageList;
    }

    @Transactional
    public RentalManage findById(Long id) {
        return this.rentalManageRepository.findById(id).orElse(null);
    }

    // 追加byrepository

    @Transactional
    public Long countByStatusAndNotId(Long id, String stockId) {
        return this.rentalManageRepository.countByStatusAndNotId(id, stockId);
    }

    // 追加②
    @Transactional
    public Long countByStatusAndExpectedReturnBeforeAndNotId(Date expectedRentalOn, Date expectedReturnOn, Long id,
            String stockId) {
        return this.rentalManageRepository.countByStatusAndExpectedReturnBeforeAndNotId(expectedRentalOn,
                expectedReturnOn, id, stockId);
    }

    @Transactional
    public Long countByStatusAndNotIdAdd(String stockId) {
        return this.rentalManageRepository.countByStatusAndNotIdAdd(stockId);
    }

    // 追加②
    @Transactional
    public Long countByStatusAndExpectedReturnBeforeAndNotIdAdd(Date expectedRentalOn, Date expectedReturnOn,
            String stockId) {
        return this.rentalManageRepository.countByStatusAndExpectedReturnBeforeAndNotIdAdd(expectedRentalOn,
                expectedReturnOn, stockId);
    }

    @Transactional
    public void save(RentalManageDto rentalManageDto) throws Exception {
        try {
            Account account = this.accountRepository.findByEmployeeId(rentalManageDto.getEmployeeId()).orElse(null);
            if (account == null) {
                throw new Exception("Account not found.");
            }

            Stock stock = this.stockRepository.findById(rentalManageDto.getStockId()).orElse(null);
            if (stock == null) {
                throw new Exception("Stock not found.");
            }

            RentalManage rentalManage = new RentalManage();
            rentalManage = setRentalStatusDate(rentalManage, rentalManageDto.getStatus());

            rentalManage.setAccount(account);
            rentalManage.setExpectedRentalOn(rentalManageDto.getExpectedRentalOn());
            rentalManage.setExpectedReturnOn(rentalManageDto.getExpectedReturnOn());
            rentalManage.setStatus(rentalManageDto.getStatus());
            rentalManage.setStock(stock);

            // データベースへの保存
            this.rentalManageRepository.save(rentalManage);
        } catch (Exception e) {
            throw e;
        }
    }

    // 更新
    @Transactional
    public void update(Long id, RentalManageDto rentalManageDto) throws Exception {
        try {
            // 既存レコード取得
            RentalManage updateTargetRental = this.rentalManageRepository.findById(id).orElse(null);
            if (updateTargetRental == null) {
                throw new Exception("RentalManage record not found.");
            }
            Account account = this.accountRepository.findByEmployeeId(rentalManageDto.getEmployeeId()).orElse(null);
            if (account == null) {
                throw new Exception("Account not found.");
            }

            Stock stock = this.stockRepository.findById(rentalManageDto.getStockId()).orElse(null);
            if (stock == null) {
                throw new Exception("Stock not found.");
            }

            updateTargetRental.setId(rentalManageDto.getId());
            updateTargetRental.setAccount(account);
            updateTargetRental.setExpectedRentalOn(rentalManageDto.getExpectedRentalOn());
            updateTargetRental.setExpectedReturnOn(rentalManageDto.getExpectedReturnOn());
            updateTargetRental.setStatus(rentalManageDto.getStatus());
            updateTargetRental.setStock(stock);

            // データベースへの保存
            this.rentalManageRepository.save(updateTargetRental);
        } catch (Exception e) {
            throw e;
        }
    }

    private RentalManage setRentalStatusDate(RentalManage rentalManage, Integer status) {
        Timestamp timestamp = new Timestamp(System.currentTimeMillis());

        if (status == RentalStatus.RENTALING.getValue()) {
            rentalManage.setRentaledAt(timestamp);
        } else if (status == RentalStatus.RETURNED.getValue()) {
            rentalManage.setReturnedAt(timestamp);
        } else if (status == RentalStatus.CANCELED.getValue()) {
            rentalManage.setCanceledAt(timestamp);
        }

        return rentalManage;
    }
}
