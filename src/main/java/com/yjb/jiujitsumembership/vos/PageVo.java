package com.yjb.jiujitsumembership.vos;

public class PageVo {
    public final int rowCount; // 한 페이지에 표시할 게시글의 수
    public final int page; // 사용자가 요청한 페이지 번호
    public final int totalCount; // 전체 게시글의 수
    public final int maxPage; // 이동 가능한 최대 페이지 번호
    public final int dbOffset; // SELECT 시 OFFSET 값

    public PageVo(int rowCount, int page, int totalCount) {
        this.totalCount = totalCount;
        this.rowCount = rowCount;
        this.maxPage = Math.max(1, totalCount / rowCount + (totalCount % rowCount == 0 ? 0 : 1));
        this.page = Math.min(page, this.maxPage);
        this.dbOffset = Math.max(0, (this.page - 1) * rowCount);
    }
}
