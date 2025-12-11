package jp.co.metateam.library.model;

import java.util.Comparator;

public class BookMstDtoComparator implements Comparator<BookMstDto> {

    @Override
    public int compare(BookMstDto o1, BookMstDto o2) {
        // 在庫数 (降順)
        return Long.compare(o2.getStockCount(), o1.getStockCount());
    }
}