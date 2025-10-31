package jp.co.metateam.library.controller;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

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

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jp.co.metateam.library.model.BookMst;
import jp.co.metateam.library.model.RentalManage;
import jp.co.metateam.library.model.Stock;
import jp.co.metateam.library.model.StockDto;
import jp.co.metateam.library.service.StockService;
import jp.co.metateam.library.values.StockStatus;

/**
 * 在庫情報 REST API
 */
@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping
    public List<StockSummaryResponse> list() {
        return this.stockService.findAll().stream()
                .map(StockSummaryResponse::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable("id") String id) {
        Stock stock = this.stockService.findById(id);

        if (stock == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("errors", List.of(Map.of("field", "id", "message", "在庫が見つかりません"))));
        }

        return ResponseEntity.ok(StockDetailResponse.from(stock));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody StockRequest request) {
        if (this.stockService.findById(request.id()) != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("errors", List.of(Map.of("field", "id", "message", "同じ在庫管理番号が既に存在します"))));
        }

        StockDto stockDto = request.toDto();
        try {
            this.stockService.save(stockDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("errors", List.of(Map.of("field", "bookId", "message", "書籍情報の取得に失敗しました"))));
        }

        Stock stock = this.stockService.findById(request.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(StockDetailResponse.from(stock));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable("id") String id, @Valid @RequestBody StockRequest request) {
        StockDto stockDto = request.toDto();
        stockDto.setId(id);
        try {
            this.stockService.update(id, stockDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("errors", List.of(Map.of("field", "id", "message", "在庫が見つかりません"))));
        }

        Stock stock = this.stockService.findById(id);
        return ResponseEntity.ok(StockDetailResponse.from(stock));
    }

    @GetMapping("/calendar")
    public StockCalendarResponse calendar(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {

        LocalDate today = year == null || month == null ? LocalDate.now() : LocalDate.of(year, month, 1);
        Integer targetYear = year == null ? today.getYear() : year;
        Integer targetMonth = today.getMonthValue();
        LocalDate nowDate = LocalDate.now(ZoneId.of("Asia/Tokyo"));

        LocalDate startDate = LocalDate.of(targetYear, targetMonth, 1);
        Integer daysInMonth = startDate.lengthOfMonth();

        List<Object> daysOfWeek = this.stockService.generateDaysOfWeek(targetYear, targetMonth, startDate, daysInMonth);
        List<List<String>> stocks = this.stockService.generateValues(targetYear, targetMonth, daysInMonth);

        List<StockCalendarResponse.BookRow> bookRows = stocks.stream()
                .map(row -> new StockCalendarResponse.BookRow(
                        row.get(0),
                        Integer.parseInt(row.get(1)),
                        row.subList(2, row.size())))
                .toList();

        List<Integer> yearList = IntStream.rangeClosed(2006, 2100).boxed().collect(Collectors.toList());
        List<Integer> monthList = IntStream.rangeClosed(1, 12).boxed().collect(Collectors.toList());

        return new StockCalendarResponse(
                targetYear,
                targetMonth,
                daysOfWeek,
                daysInMonth,
                nowDate.toString(),
                bookRows,
                yearList,
                monthList);
    }

    public record StockRequest(
            @NotEmpty String id,
            @NotNull Long bookId,
            @NotNull Integer status,
            @NotNull @Min(0) Integer price) {

        StockDto toDto() {
            StockDto dto = new StockDto();
            dto.setId(id);
            dto.setBookId(bookId);
            dto.setStatus(status);
            dto.setPrice(price);
            return dto;
        }
    }

    public record StockSummaryResponse(
            String id,
            Integer status,
            Integer price,
            StockStatusInfo statusInfo,
            StockBookInfo book) {

        static StockSummaryResponse from(Stock stock) {
            return new StockSummaryResponse(
                    stock.getId(),
                    stock.getStatus(),
                    stock.getPrice(),
                    StockStatusInfo.from(stock.getStatus()),
                    StockBookInfo.from(stock.getBookMst()));
        }
    }

    public record StockDetailResponse(
            String id,
            Integer status,
            Integer price,
            StockStatusInfo statusInfo,
            StockBookInfo book,
            List<RentalSummary> rentals) {

        static StockDetailResponse from(Stock stock) {
            List<RentalSummary> rentals = stock.getRentalManages().stream()
                    .map(RentalSummary::from)
                    .toList();
            return new StockDetailResponse(
                    stock.getId(),
                    stock.getStatus(),
                    stock.getPrice(),
                    StockStatusInfo.from(stock.getStatus()),
                    StockBookInfo.from(stock.getBookMst()),
                    rentals);
        }
    }

    public record StockStatusInfo(Integer value, String label) {
        static StockStatusInfo from(Integer status) {
            StockStatus matched = status != null && status == StockStatus.RENT_NOT_AVAILABLE.getValue()
                    ? StockStatus.RENT_NOT_AVAILABLE
                    : StockStatus.RENT_AVAILABLE;
            return new StockStatusInfo(matched.getValue(), matched.getText());
        }
    }

    public record StockBookInfo(Long id, String title) {
        static StockBookInfo from(BookMst bookMst) {
            if (bookMst == null) {
                return null;
            }
            return new StockBookInfo(bookMst.getId(), bookMst.getTitle());
        }
    }

    public record RentalSummary(
            Long id,
            Integer status,
            String expectedRentalOn,
            String expectedReturnOn,
            String accountId,
            String accountName) {

        static RentalSummary from(RentalManage rental) {
            return new RentalSummary(
                    rental.getId(),
                    rental.getStatus(),
                    rental.getExpectedRentalOn() == null ? null : rental.getExpectedRentalOn().toString(),
                    rental.getExpectedReturnOn() == null ? null : rental.getExpectedReturnOn().toString(),
                    rental.getAccount() == null ? null : rental.getAccount().getEmployeeId(),
                    rental.getAccount() == null ? null : rental.getAccount().getName());
        }
    }

    public record StockCalendarResponse(
            Integer targetYear,
            Integer targetMonth,
            List<Object> daysOfWeek,
            Integer daysInMonth,
            String nowDate,
            List<BookRow> books,
            List<Integer> yearOptions,
            List<Integer> monthOptions) {

        public record BookRow(String title, Integer totalAvailable, List<String> dailyAvailability) {
        }
    }
}
