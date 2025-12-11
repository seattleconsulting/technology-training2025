package jp.co.metateam.library.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jp.co.metateam.library.model.BookMst;
import jp.co.metateam.library.model.BookMstDto;
import jp.co.metateam.library.service.BookMstService;
import jp.co.metateam.library.service.StockService;

/**
 * 書籍関連 REST API
 */
@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookMstService bookMstService;
    private final StockService stockService;

    public BookController(BookMstService bookMstService, StockService stockService) {
        this.bookMstService = bookMstService;
        this.stockService = stockService;
    }

    @GetMapping
    public List<BookListResponse> list(boolean createFlg) {
        List<BookMstDto> bookMstList = this.bookMstService.findAvailableWithStockCount(createFlg);
        return bookMstList.stream()
                .map(dto -> new BookListResponse(
                        dto.getId(),
                        dto.getTitle(),
                        dto.getIsbn(),
                        dto.getStockCount()))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable("id") Long id) {
        Optional<BookMst> bookOpt = this.bookMstService.findById(id);
        if (bookOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("errors", List.of(Map.of("field", "id", "message", "書籍が見つかりません"))));
        }

        BookMst book = bookOpt.get();
        int stockCount = stockService.findStockAvailableAll().stream()
                .filter(stock -> stock.getBookMst() != null && stock.getBookMst().getId().equals(book.getId()))
                .toList()
                .size();

        return ResponseEntity.ok(new BookDetailResponse(
                book.getId(),
                book.getTitle(),
                book.getIsbn(),
                stockCount));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody BookRequest request) {
        BookMstDto dto = new BookMstDto();
        dto.setTitle(request.title());
        dto.setIsbn(request.isbn());

        try {
            this.bookMstService.save(dto);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("errors",
                            List.of(Map.of("field", "isbn", "message", "同じISBNの書籍が既に存在します"))));
        }

        List<BookListResponse> responses = list(true).stream()
                .filter(book -> book.isbn().equals(request.isbn()))
                .toList();
        if (responses.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "登録が完了しました"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(responses.get(0));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Long id, @Valid @RequestBody BookRequest request) {
        BookMstDto dto = new BookMstDto();
        dto.setTitle(request.title());
        dto.setIsbn(request.isbn());

        try {
            this.bookMstService.update(id, dto);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("errors",
                            List.of(Map.of("field", "isbn", "message", "同じISBNの書籍が既に存在します"))));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("errors", List.of(Map.of("field", "id", "message", "書籍が見つかりません"))));
        }

        return detail(id);
    }

    public record BookRequest(
            @NotEmpty @Size(max = 255) String title,
            @NotEmpty @Pattern(regexp = "^[0-9]{13}$", message = "ISBNは13桁の数字で入力してください") String isbn) {
    }

    public record BookListResponse(Long id, String title, String isbn, long availableStockCount) {
    }

    public record BookDetailResponse(Long id, String title, String isbn, long availableStockCount) {
    }
}
