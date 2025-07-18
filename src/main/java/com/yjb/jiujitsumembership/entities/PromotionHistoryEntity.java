package com.yjb.jiujitsumembership.entities;

import lombok.*;

import java.time.LocalDate;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "promotionId")
public class PromotionHistoryEntity {
    public int promotionId;
    public String userEmail;
    public String beltCode;
    public int stripeCount;
    public LocalDate promotedAt;
}
