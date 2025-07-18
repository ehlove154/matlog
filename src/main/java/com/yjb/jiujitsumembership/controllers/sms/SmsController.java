package com.yjb.jiujitsumembership.controllers.sms;

import com.yjb.jiujitsumembership.dtoes.SmsRequestDto;
import com.yjb.jiujitsumembership.dtoes.SmsVerificationRequestDto;
import com.yjb.jiujitsumembership.services.SmsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/sms")
public class SmsController {
    private final SmsService smsService;

    public SmsController(@Autowired SmsService smsService){
        this.smsService = smsService;
    }

    @PostMapping("/send")
    @ResponseBody
    public ResponseEntity<?> SendSMS(@RequestBody @Valid SmsRequestDto smsRequestDto){
        System.out.println("[DEBUG] SMS 요청 들어옴: " + smsRequestDto.getPhoneNum());
        smsService.SendSms(smsRequestDto);
        Map<String, Object> result = new HashMap<>();
        result.put("result", "success");
        result.put("message", "문자를 전송했습니다.");
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@RequestBody @Valid SmsVerificationRequestDto requestDto) {
        boolean isVerified = smsService.verifyCode(requestDto.getPhoneNum(), requestDto.getCode());

        Map<String, String> result = new HashMap<>();
        result.put("result", isVerified ? "success" : "failure");

        return ResponseEntity.ok(result);
    }

}