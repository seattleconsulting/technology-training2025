package jp.co.metateam.library.model;
 
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
 
import org.springframework.format.annotation.DateTimeFormat;
 
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
//追加
import jp.co.metateam.library.values.RentalStatus;
import java.util.Optional;
 
/**
 * 貸出管理DTO
 */
@Getter
@Setter
public class RentalManageDto {
 
    private Long id;
 
    @NotEmpty(message="在庫管理番号は必須です")
    private String stockId;
 
    @NotEmpty(message="社員番号は必須です")
    private String employeeId;
 
    @NotNull(message="貸出ステータスは必須です")
    private Integer status;
 
    @DateTimeFormat(pattern="yyyy-MM-dd")
    @NotNull(message="貸出予定日は必須です")
    private Date expectedRentalOn;
 
    @DateTimeFormat(pattern="yyyy-MM-dd")
    @NotNull(message="返却予定日は必須です")
    private Date expectedReturnOn;
 
    private Timestamp rentaledAt;
 
    private Timestamp returnedAt;
 
    private Timestamp canceledAt;
 
    private Stock stock;
 
    private Account account;

 //バリテーションチェック貸出ステータスの
 public Optional<String> isStatusError(Integer preStatus) {
    if (preStatus == RentalStatus.RENT_WAIT.getValue() && this.status == RentalStatus.RETURNED.getValue()) {
        return Optional.of("「貸出待ち」から「返却済み」は選択できません");
    } else if (preStatus == RentalStatus.RENTALING.getValue() && this.status == RentalStatus.RENT_WAIT.getValue()) {
        return Optional.of("「貸出中」から「貸出待ち」には変更できません");
    } else if (preStatus == RentalStatus.RENTALING.getValue() && this.status == RentalStatus.CANCELED.getValue()) {
        return Optional.of("「貸出中」から「キャンセル」には変更できません");
    } else if (preStatus == RentalStatus.RETURNED.getValue() && this.status != RentalStatus.RETURNED.getValue()) {
        return Optional.of("「返却済み」からステータスは変更できません");
    }else if (preStatus == RentalStatus.CANCELED.getValue() && this.status != RentalStatus.CANCELED.getValue()) {
        return Optional.of("「キャンセル」からステータスは変更できません");
    }
        return Optional.empty();
   
}

    //日付チェック
    public String isDateError(RentalManage rentalManage, RentalManageDto rentalManageDto) {
        LocalDate nowDate = LocalDate.now(ZoneId.of("Asia/Tokyo"));

        //古いステータスと新しいステータス
        Integer preStatus = rentalManage.getStatus();
        Integer postStatus = rentalManageDto.getStatus();

        //両予定日をLocalDate型に変換
        LocalDate expectedRentalOn = rentalManageDto.getExpectedRentalOn().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

        //if文・貸出待ち→貸出中
        if(preStatus == 0 && postStatus == 1) {
            if(!expectedRentalOn.equals(nowDate)) {
                return "現在の日付を選択してください";
            }
        }
        return null;
    }

    // 貸出<返却チェック
    public String isReturnDateError(RentalManageDto rentalManageDto) {
        Date expectedRentalOn = rentalManageDto.getExpectedRentalOn();
        Date expectedReturnOn = rentalManageDto.getExpectedReturnOn();

        if(expectedRentalOn.after(expectedReturnOn)) {
            return "返却予定日は貸出予定日より後の日付を選択してください";
        }
        return null;
    }
}
