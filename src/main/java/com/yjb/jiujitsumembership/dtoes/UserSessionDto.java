package com.yjb.jiujitsumembership.dtoes;

import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserSessionDto {
    private Integer reservationId;
    private String userEmail;
    private Integer classId;
    private LocalDateTime reservedAt;
    private boolean isAttended;
    private LocalDateTime attendedAt;
    private String className;
    private String coach;
    private LocalTime startTime;
    private LocalTime endTime;
    private String day;
}