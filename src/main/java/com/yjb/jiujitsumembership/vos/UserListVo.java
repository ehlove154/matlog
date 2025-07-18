package com.yjb.jiujitsumembership.vos;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserListVo {
    public String getFormattedContact() {
        if (this.contact == null || this.contact.length() != 11) {
            return this.contact;
        }
        return this.contact.replaceFirst("(\\d{3})(\\d{4})(\\d{4})", "$1-$2-$3");
    }

    private int index;
    private String email;
    private String name;
    private LocalDateTime createdAt; // 회원가입일시
    private String membership;
    private String membershipName;
    private LocalDate joinedDate; //회원권 시작 일시
    private LocalDate expireDate; //회원권 만료 일시
    private String contact;
    private String address;
    private String belt;
    private Integer stripe;
    private LocalDate promotionDate;
    private int monthlyAttendance; // 당월 출석 횟수
    private int totalAttendance; // 총 출석 횟수
    private LocalDate recentAttendance; // 최근 출석일
    private String status; // 회원권 상태
}