package com.yjb.jiujitsumembership.dtoes;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SmsVerificationRequestDto {
    @NotEmpty(message = "전화번호는 필수입니다.")
    private String phoneNum;

    @NotEmpty(message = "인증코드는 필수입니다.")
    private String code;
}
