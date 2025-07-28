package com.yjb.jiujitsumembership.entities;

import lombok.*;

import java.time.LocalDate;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "membershipCode")
public class MembershipEntity {
    private String membershipCode;
    private String displayText;
    private Integer durationMonth;
    private int price;
    private boolean isDeleted;
}
