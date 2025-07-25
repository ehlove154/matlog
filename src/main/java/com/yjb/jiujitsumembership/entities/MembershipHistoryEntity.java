package com.yjb.jiujitsumembership.entities;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "membershipHistoriesId")
public class MembershipHistoryEntity {
    private int membershipHistoriesId;
    private String userEmail;
    private String membershipCode;
    private int price;
    private String paymentMethod;
    private LocalDate joinedDate;
    private LocalDate endDate;
    private boolean isActive;
    private LocalDateTime createdAt;
}
