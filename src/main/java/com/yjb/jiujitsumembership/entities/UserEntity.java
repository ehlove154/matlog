package com.yjb.jiujitsumembership.entities;

import lombok.*;
import org.springframework.data.annotation.Transient;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "email")
public class UserEntity {
    public enum Gender {
        F,
        M
    }

    public enum UserRole {
        ADMIN,
        MASTER,
        MEMBER
    }

    @Transient
    private String gymName;

    @Transient
    private Integer stripe;

    private String email;
    private String password;
    private String name;
    private LocalDate birth;
    private String gender;
    private String contact;
    private String addressPostal;
    private String addressPrimary;
    private String addressSecondary;
    private String belt;
    private Integer gymId;
    private LocalDateTime lastSignedAt;
    private String lastSignedUa;
    private String membership;
    private LocalDate membershipJoinedDate;
    private LocalDate membershipExpireDate;
    private String userRole;
    private boolean isDelete;
    private boolean isSuspended;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    private LocalDate lastPromotionAt;
}
