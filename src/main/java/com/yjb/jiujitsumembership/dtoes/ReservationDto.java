package com.yjb.jiujitsumembership.dtoes;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ReservationDto {
    private Integer reservationId;
    private String email;
    private String name;
    private String belt;
    private String displayText;
    private Integer stripeCount;
    private String beltWithStripe;
    private boolean isAttended;
}