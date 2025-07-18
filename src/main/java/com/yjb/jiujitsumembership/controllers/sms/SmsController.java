package com.yjb.jiujitsumembership.controllers;

import com.yjb.jiujitsumembership.dtoes.SmsRequestDto;
import com.yjb.jiujitsumembership.services.SmsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        smsService.SendSms(smsRequestDto);
        return ResponseEntity.ok("문자를 전송했습니다.");
    }
}
