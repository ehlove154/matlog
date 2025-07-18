package com.yjb.jiujitsumembership.dtoes;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.validation.annotation.Validated;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Validated
public class SmsRequestDto {
    @NotEmpty(message = "휴대폰 번호를 입력해주세요")
    private String phoneNum;
}
