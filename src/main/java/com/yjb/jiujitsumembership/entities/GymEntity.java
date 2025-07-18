package com.yjb.jiujitsumembership.entities;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "gymId")
public class GymEntity {
    private int gymId;
    private String userEmail;
    private String gymName;
    private boolean isActive;
    private String addressPostal;
    private String addressPrimary;
    private String addressSecondary;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
}
