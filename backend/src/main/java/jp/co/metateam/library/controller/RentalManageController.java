package jp.co.metateam.library.controller;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jp.co.metateam.library.model.Account;
import jp.co.metateam.library.model.RentalManage;
import jp.co.metateam.library.model.RentalManageDto;
import jp.co.metateam.library.model.Stock;
import jp.co.metateam.library.service.AccountService;
import jp.co.metateam.library.service.RentalManageService;
import jp.co.metateam.library.service.StockService;
import jp.co.metateam.library.values.RentalStatus;

/**
 * 貸出管理 REST API
 */
@RestController
@RequestMapping("/api/rentals")
public class RentalManageController {

    private final AccountService accountService;
    private final RentalManageService rentalManageService;
    private final StockService stockService;

    private static final ZoneId DEFAULT_ZONE = ZoneId.of("Asia/Tokyo");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");

    public RentalManageController(
            AccountService accountService,
            RentalManageService rentalManageService,
            StockService stockService) {
        this.accountService = accountService;
        this.rentalManageService = rentalManageService;
        this.stockService = stockService;
    }

    @GetMapping
    public List<RentalSummaryResponse> list() {
        return this.rentalManageService.findAll().stream()
                .map(RentalSummaryResponse::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable("id") Long id) {
        RentalManage rental = this.rentalManageService.findById(id);
        if (rental == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("errors", List.of(Map.of("field", "id", "message", "貸出情報が見つかりません"))));
        }
        return ResponseEntity.ok(RentalDetailResponse.from(rental));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody RentalRequest request) {
        RentalManageDto dto = request.toDto();

        List<Map<String, String>> errors = validateForCreate(dto);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("errors", errors));
        }

        try {
            this.rentalManageService.save(dto);
        } catch (Exception e) {
            String message = e.getMessage() == null ? "" : e.getMessage();
            String field = message.contains("Account") ? "employeeId" : "stockId";
            String errorMessage = message.contains("Account") ? "社員番号が存在しません" : "在庫情報の取得に失敗しました";
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("errors", List.of(Map.of("field", field, "message", errorMessage))));
        }

        RentalManage created = this.rentalManageService.findAll().stream()
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .findFirst()
                .orElse(null);

        if (created == null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "登録が完了しました"));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(RentalDetailResponse.from(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Long id, @Valid @RequestBody RentalRequest request) {
        RentalManage rental = this.rentalManageService.findById(id);
        if (rental == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("errors", List.of(Map.of("field", "id", "message", "貸出情報が見つかりません"))));
        }

        RentalManageDto dto = request.toDto();
        dto.setId(id);

        List<Map<String, String>> errors = validateForUpdate(id, rental, dto);
        if (!errors.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("errors", errors));
        }

        try {
            this.rentalManageService.update(id, dto, rental);
        } catch (Exception e) {
            String message = e.getMessage() == null ? "" : e.getMessage();
            String field = message.contains("Account") ? "employeeId" : "stockId";
            String errorMessage = message.contains("Account") ? "社員番号が存在しません" : "在庫情報の取得に失敗しました";
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("errors", List.of(Map.of("field", field, "message", errorMessage))));
        }

        RentalManage updated = this.rentalManageService.findById(id);
        return ResponseEntity.ok(RentalDetailResponse.from(updated));
    }

    @GetMapping("/options/accounts")
    public List<AccountOption> accountOptions() {
        return this.accountService.findAll().stream()
                .map(account -> new AccountOption(account.getEmployeeId(), account.getName()))
                .collect(Collectors.toList());
    }

    @GetMapping("/options/stocks")
    public List<StockOption> stockOptions(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "date", required = false) Date date,
            @RequestParam(value = "onlyAvailable", defaultValue = "false") boolean onlyAvailable) {

        List<Stock> stocks;
        if (title != null && date != null) {
            stocks = this.stockService.availableStockValues(date, title);
        } else if (onlyAvailable) {
            stocks = this.stockService.findStockAvailableAll();
        } else {
            stocks = this.stockService.findAll();
        }

        return stocks.stream()
                .map(stock -> new StockOption(
                        stock.getId(),
                        stock.getBookMst() == null ? null : stock.getBookMst().getTitle(),
                        stock.getStatus()))
                .collect(Collectors.toList());
    }

    private List<Map<String, String>> validateForCreate(RentalManageDto dto) {
        List<Map<String, String>> errors = new ArrayList<>();

        if (dto.getStatus() == null) {
            errors.add(Map.of("field", "status", "message", "貸出ステータスは必須です"));
        }

        if (dto.getExpectedRentalOn() != null && dto.getExpectedReturnOn() != null) {
            String returnError = dto.isReturnDateError(dto);
            if (returnError != null) {
                errors.add(Map.of("field", "expectedReturnOn", "message", returnError));
            }
        }

        if (dto.getStatus() == RentalStatus.RENT_WAIT.getValue() || dto.getStatus() == RentalStatus.RENTALING.getValue()) {
            Long rentalSumAdd = this.rentalManageService.countByStatusAndNotIdAdd(dto.getStockId());
            if (rentalSumAdd != 0) {
                Long conflictCount = this.rentalManageService.countByStatusAndExpectedReturnBeforeAndNotIdAdd(
                        dto.getExpectedRentalOn(),
                        dto.getExpectedReturnOn(),
                        dto.getStockId());
                if (!rentalSumAdd.equals(conflictCount)) {
                    errors.add(Map.of("field", "expectedRentalOn", "message", "この期間は貸出できません"));
                    errors.add(Map.of("field", "expectedReturnOn", "message", "この期間は貸出できません"));
                }
            }
        }

        return errors;
    }

    private List<Map<String, String>> validateForUpdate(Long id, RentalManage rental, RentalManageDto dto) {
        List<Map<String, String>> errors = new ArrayList<>();

        Optional<String> statusError = dto.isStatusError(rental.getStatus());
        statusError.ifPresent(error -> errors.add(Map.of("field", "status", "message", error)));

        String dateError = dto.isDateError(rental, dto);
        if (dateError != null) {
            errors.add(Map.of("field", "expectedRentalOn", "message", dateError));
        }

        if (dto.getExpectedRentalOn() != null && dto.getExpectedReturnOn() != null) {
            String returnError = dto.isReturnDateError(dto);
            if (returnError != null) {
                errors.add(Map.of("field", "expectedReturnOn", "message", returnError));
            }
        }

        if (dto.getStatus() == RentalStatus.RENT_WAIT.getValue() || dto.getStatus() == RentalStatus.RENTALING.getValue()) {
            Long rentalSum = this.rentalManageService.countByStatusAndNotId(id, dto.getStockId());
            if (rentalSum != 0) {
                Long conflictCount = this.rentalManageService.countByStatusAndExpectedReturnBeforeAndNotId(
                        dto.getExpectedRentalOn(),
                        dto.getExpectedReturnOn(),
                        id,
                        dto.getStockId());
                if (!rentalSum.equals(conflictCount)) {
                    errors.add(Map.of("field", "expectedRentalOn", "message", "この期間は貸出できません"));
                    errors.add(Map.of("field", "expectedReturnOn", "message", "この期間は貸出できません"));
                }
            }
        }

        return errors;
    }

    public record RentalRequest(
            @NotEmpty String stockId,
            @NotEmpty String employeeId,
            @NotNull Integer status,
            @NotNull @JsonFormat(pattern = "yyyy-MM-dd") java.util.Date expectedRentalOn,
            @NotNull @JsonFormat(pattern = "yyyy-MM-dd") java.util.Date expectedReturnOn) {

        RentalManageDto toDto() {
            RentalManageDto dto = new RentalManageDto();
            dto.setStockId(stockId);
            dto.setEmployeeId(employeeId);
            dto.setStatus(status);
            dto.setExpectedRentalOn(expectedRentalOn);
            dto.setExpectedReturnOn(expectedReturnOn);
            return dto;
        }
    }

    public record RentalSummaryResponse(
            Long id,
            RentalStatusInfo status,
            String expectedRentalOn,
            String expectedReturnOn,
            String stockId,
            String employeeId,
            String employeeName) {

        static RentalSummaryResponse from(RentalManage rental) {
            Account account = rental.getAccount();
            return new RentalSummaryResponse(
                    rental.getId(),
                    RentalStatusInfo.from(rental.getStatus()),
                    formatDate(rental.getExpectedRentalOn()),
                    formatDate(rental.getExpectedReturnOn()),
                    rental.getStock() == null ? null : rental.getStock().getId(),
                    account == null ? null : account.getEmployeeId(),
                    account == null ? null : account.getName());
        }
    }

    public record RentalDetailResponse(
            Long id,
            RentalStatusInfo status,
            String expectedRentalOn,
            String expectedReturnOn,
            String rentaledAt,
            String returnedAt,
            String canceledAt,
            StockInfo stock,
            AccountInfo account) {

        static RentalDetailResponse from(RentalManage rental) {
            return new RentalDetailResponse(
                    rental.getId(),
                    RentalStatusInfo.from(rental.getStatus()),
                    formatDate(rental.getExpectedRentalOn()),
                    formatDate(rental.getExpectedReturnOn()),
                    formatTimestamp(rental.getRentaledAt()),
                    formatTimestamp(rental.getReturnedAt()),
                    formatTimestamp(rental.getCanceledAt()),
                    StockInfo.from(rental.getStock()),
                    AccountInfo.from(rental.getAccount()));
        }
    }

    public record RentalStatusInfo(Integer value, String label) {
        static RentalStatusInfo from(Integer status) {
            RentalStatus matched = RentalStatus.RENT_WAIT;
            for (RentalStatus rentalStatus : RentalStatus.values()) {
                if (rentalStatus.getValue().equals(status)) {
                    matched = rentalStatus;
                    break;
                }
            }
            return new RentalStatusInfo(matched.getValue(), matched.getText());
        }
    }

    public record StockInfo(String id, String title) {
        static StockInfo from(Stock stock) {
            if (stock == null) {
                return null;
            }
            return new StockInfo(
                    stock.getId(),
                    stock.getBookMst() == null ? null : stock.getBookMst().getTitle());
        }
    }

    public record AccountInfo(String employeeId, String name, String email) {
        static AccountInfo from(Account account) {
            if (account == null) {
                return null;
            }
            return new AccountInfo(account.getEmployeeId(), account.getName(), account.getEmail());
        }
    }

    public record AccountOption(String employeeId, String name) {
    }

    public record StockOption(String stockId, String title, Integer status) {
    }

    private static String formatDate(java.util.Date date) {
        if (date == null) {
            return null;
        }
        return DATE_FORMATTER.format(date.toInstant().atZone(DEFAULT_ZONE).toLocalDate());
    }

    private static String formatTimestamp(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        return TIMESTAMP_FORMATTER.format(timestamp.toInstant().atZone(DEFAULT_ZONE));
    }
}
