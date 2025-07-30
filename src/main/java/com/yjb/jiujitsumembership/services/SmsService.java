package com.yjb.jiujitsumembership.services;

import com.yjb.jiujitsumembership.dtoes.SmsRequestDto;
import com.yjb.jiujitsumembership.utils.SmsCertificationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SmsService {

    private final SmsCertificationUtil smsCertificationUtil;
    private final Map<String, String> verificationCodes = new ConcurrentHashMap<>();

    @Autowired
    public SmsService(SmsCertificationUtil smsCertificationUtil) {
        this.smsCertificationUtil = smsCertificationUtil;
    }

    public void SendSms(SmsRequestDto smsRequestDto) {
        String phoneNum = smsRequestDto.getPhoneNum();
        String certificationCode = String.valueOf((int) (Math.random() * 900000 + 100000));
        smsCertificationUtil.sendSMS(phoneNum, certificationCode);

        // 🔐 인증 코드 저장
        verificationCodes.put(phoneNum, certificationCode);
    }

    public boolean verifyCode(String phoneNum, String code) {
        String savedCode = verificationCodes.get(phoneNum);
        return savedCode != null && savedCode.equals(code);
    }

}
