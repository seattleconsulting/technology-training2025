package jp.co.metateam.library.controller;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;

import jp.co.metateam.library.model.RentalManage;
import jp.co.metateam.library.service.AccountService;
import jp.co.metateam.library.service.RentalManageService;
import jp.co.metateam.library.service.StockService;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.PostMapping;
import jp.co.metateam.library.model.RentalManageDto;
import jp.co.metateam.library.service.BookMstService;
import jp.co.metateam.library.model.BookMst;
import jp.co.metateam.library.values.RentalStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import jp.co.metateam.library.model.Account;
import jp.co.metateam.library.model.Stock;
import jp.co.metateam.library.constants.Constants;
import org.springframework.validation.FieldError;

/**
 * 貸出管理関連クラスß
 */
@Log4j2
@Controller
public class RentalManageController {

    private final BookMstService bookMstService;
    private final AccountService accountService;
    private final RentalManageService rentalManageService;
    private final StockService stockService;
    // 追加
    private String rentalErrorEdit;
    private String rentalErrorAdd;

    @Autowired
    public RentalManageController(BookMstService bookMstService,
            AccountService accountService,
            RentalManageService rentalManageService,
            StockService stockService) {
        this.accountService = accountService;
        this.rentalManageService = rentalManageService;
        this.stockService = stockService;
        this.bookMstService = bookMstService;
    }

    /**
     * 貸出一覧画面初期表示
     * 
     * @param model
     * @return
     */
    @GetMapping("/rental/index")
    public String index(Model model) {
        // 貸出管理テーブルから全件取得
        List<RentalManage> rentalManageList = this.rentalManageService.findAll();

        // 貸出一覧画面に渡すデータをmodelに追加
        model.addAttribute("rentalManageList", rentalManageList);

        // 貸出一覧画面に遷移
        return "rental/index";
    }

    @GetMapping("/rental/add")
    public String add(Model model, @ModelAttribute RentalManageDto rentalManageDto) {
        List<Account> accounts = this.accountService.findAll();
        List<Stock> stockList = this.stockService.findStockAvailableAll();

        model.addAttribute("accounts", accounts);
        model.addAttribute("stockList", stockList);
        model.addAttribute("rentalStatus", RentalStatus.values());

        if (!model.containsAttribute("rentalManageDto")) {
            model.addAttribute("rentalManageDto", new RentalManageDto());
        }
        return "rental/add";
    }

    @PostMapping("/rental/add")
    // バリデーションチェックの呼び出し
    public String save(@Valid @ModelAttribute RentalManageDto rentalManageDto, BindingResult result,
            RedirectAttributes ra, Model model) {
        try {
            String stockId = rentalManageDto.getStockId();
            Integer status = rentalManageDto.getStatus();

            Long rentalSumAdd = this.rentalManageService.countByStatusAndNotIdAdd(stockId);
            if (status == 0 || status == 1) {
                if (!(rentalSumAdd == 0)) {
                    Date expectedRentalOn = rentalManageDto.getExpectedRentalOn();
                    Date expectedReturnOn = rentalManageDto.getExpectedReturnOn();
                    Long rentalNumAdd = this.rentalManageService
                            .countByStatusAndExpectedReturnBeforeAndNotIdAdd(expectedRentalOn, expectedReturnOn,
                                    stockId);

                    if (!(rentalSumAdd == rentalNumAdd)) {
                        rentalErrorAdd = "この期間は貸出できません";
                        result.addError(new FieldError("rentalManageDto", "expectedRentalOn", rentalErrorAdd));
                        result.addError(new FieldError("rentalManageDto", "expectedReturnOn", rentalErrorAdd));

                    }
                }
            }
            if (result.hasErrors()) {
                throw new Exception("Validation error.");
            }
            this.rentalManageService.save(rentalManageDto);

            return "redirect:/rental/index";
        } catch (Exception e) {
            log.error(e.getMessage());

            ra.addFlashAttribute("rentalManageDto", rentalManageDto);
            ra.addFlashAttribute("org.springframework.validation.BindingResult.rentalManageDto", result);

            // redirectをコメントアウトしてから追加した部分
            List<Account> accounts = this.accountService.findAll();
            List<Stock> stockList = this.stockService.findStockAvailableAll();

            model.addAttribute("accounts", accounts);
            model.addAttribute("stockList", stockList);
            model.addAttribute("rentalStatus", RentalStatus.values());

            return "/rental/add";
        }
    }

    @GetMapping("/rental/{id}/edit")
    public String edit(@PathVariable("id") String id, Model model) {
        List<Account> accounts = this.accountService.findAll();
        List<Stock> stockList = this.stockService.findStockAvailableAll();

        model.addAttribute("accounts", accounts);
        model.addAttribute("stockList", stockList);
        model.addAttribute("rentalStatus", RentalStatus.values());

        if (!model.containsAttribute("rentalManage")) {
            RentalManage rentalManage = this.rentalManageService.findById(Long.valueOf(id));

            // レコードのデータを挿入する箱を作る
            RentalManageDto rentalManageDto = new RentalManageDto();
            // 箱にデータを移す
            rentalManageDto.setId(rentalManage.getId());
            rentalManageDto.setEmployeeId(rentalManage.getAccount().getEmployeeId());
            rentalManageDto.setExpectedRentalOn(rentalManage.getExpectedRentalOn());
            rentalManageDto.setExpectedReturnOn(rentalManage.getExpectedReturnOn());
            rentalManageDto.setStockId(rentalManage.getStock().getId());
            rentalManageDto.setStatus(rentalManage.getStatus());

            model.addAttribute("rentalManage", rentalManageDto);
        }
        return "/rental/edit";
    }

    // 貸出編集
    @PostMapping("/rental/{id}/edit")
    public String update(@PathVariable("id") String id, @Valid @ModelAttribute RentalManageDto rentalManageDto,
            BindingResult result, RedirectAttributes ra, Model model) {
        try {

            RentalManage rentalManage = this.rentalManageService.findById(Long.valueOf(id));
            // 変更前と変更後の貸出ステータスを取得
            Optional<String> validErrorOptional = rentalManageDto.isStatusError(rentalManage.getStatus());
            // Optionalが空でない場合のみエラーを処理する
            validErrorOptional.ifPresent(validError -> {
                if (!validError.isEmpty()) {
                    result.addError(new FieldError("rentalManage", "status", validError));
                    throw new RuntimeException(validError);
                }

            });

            String stockId = rentalManageDto.getStockId();

            Long rentalSumEdit = this.rentalManageService.countByStatusAndNotId(Long.parseLong(id), stockId);

            if (!(rentalSumEdit == 0)) {
                Date expectedRentalOn = rentalManageDto.getExpectedRentalOn();
                Date expectedReturnOn = rentalManageDto.getExpectedReturnOn();
                Long rentalNum = this.rentalManageService.countByStatusAndExpectedReturnBeforeAndNotId(expectedRentalOn,
                        expectedReturnOn, Long.parseLong(id), stockId);

                if (!(rentalSumEdit == rentalNum)) {
                    rentalErrorEdit = "この期間は貸出できません";
                    result.addError(new FieldError("rentalManage", "expectedRentalOn", rentalErrorEdit));
                    result.addError(new FieldError("rentalManage", "expectedReturnOn", rentalErrorEdit));

                }
            }

            if (result.hasErrors()) {
                throw new Exception("Validation error.");
            }

            // 更新処理
            this.rentalManageService.update(Long.valueOf(id), rentalManageDto);

            return "redirect:/rental/index";
        } catch (Exception e) {
            log.error(e.getMessage());

            // 元の貸出情報再取得 別
            RentalManage rentalManage = this.rentalManageService.findById(Long.valueOf(id));

            // レコードのデータを挿入する箱を作る 別
            RentalManageDto rentalManageData = new RentalManageDto();
            // 箱にデータを移す 別
            rentalManageData.setId(rentalManage.getId());
            rentalManageData.setEmployeeId(rentalManage.getAccount().getEmployeeId());
            rentalManageData.setExpectedRentalOn(rentalManage.getExpectedRentalOn());
            rentalManageData.setExpectedReturnOn(rentalManage.getExpectedReturnOn());
            rentalManageData.setStatus(rentalManage.getStatus());
            rentalManageData.setStockId(rentalManage.getStock().getId());
            // データを表示 別
            ra.addFlashAttribute("rentalManage", rentalManageData);
            ra.addFlashAttribute("org.springframework.validation.BindingResult.rentalManage", result);

            return String.format("redirect:/rental/%s/edit", id);
        }
    }

}
