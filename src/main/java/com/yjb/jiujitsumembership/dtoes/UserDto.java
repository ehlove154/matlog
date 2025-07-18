package com.yjb.jiujitsumembership.dtoes;

import com.yjb.jiujitsumembership.entities.UserEntity;
import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserDto {
    private String email;
    private String name;
    private String belt;           // belt_code
    private String displayText;    // 벨트 표시 텍스트 (예: 블랙)
    private Integer stripeCount;   // 그랄 수
    private String beltWithStripe;
    private String gymName;

    public static UserDto from(UserEntity user) {
        return UserDto.builder()
                .email(user.getEmail())
                .name(user.getName())
                .belt(user.getBelt())
                .stripeCount(user.getStripe())
                .beltWithStripe(buildBeltWithStripe(user.getBelt(), user.getStripe()))
                .gymName(user.getGymName())
                .build();


    }

    private static String buildBeltWithStripe(String belt, Integer stripeCount) {
        if (belt == null || stripeCount == null) {
            return "";
        }
        return belt + " " + stripeCount + "그랄";
    }

}
