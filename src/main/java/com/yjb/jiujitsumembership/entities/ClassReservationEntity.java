package com.yjb.jiujitsumembership.entities;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "reservationId")
public class ClassReservationEntity {
    private int reservationId;
    private String userEmail;
    private int classId;
    private LocalDateTime reservedAt;
    private boolean isAttended;
    private LocalDateTime attendedAt;
}
