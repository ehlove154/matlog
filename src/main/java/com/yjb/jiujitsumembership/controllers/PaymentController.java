package com.yjb.jiujitsumembership.controllers;

import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.mappers.UserMapper;
import com.yjb.jiujitsumembership.results.CommonResult;
import com.yjb.jiujitsumembership.results.Result;
import com.yjb.jiujitsumembership.services.UserService;
import jakarta.servlet.http.HttpSession;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
public class PaymentController {
    private final UserService userService;
    private final UserMapper userMapper;

    @Autowired
    public PaymentController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    // 기존 폼 전송 방식은 유지합니다.
    @RequestMapping(value = "/membership/payment", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postPayment(@RequestParam(value = "amount", required = false) Integer amount,
                              @RequestParam(value = "membershipCode", required = false) String membershipCode,
                              @RequestParam(value = "email", required = false) String email) {
        JSONObject response = new JSONObject();
        Result result = this.userService.updateMembership(email, membershipCode, amount == null ? 0 : amount);
        response.put("result", result.name().toLowerCase());
        return response.toString();
    }

    // 프런트엔드에서 JSON을 전송하는 경우를 위한 추가 엔드포인트
    @PostMapping(value = "/api/membership", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postApiMembership(@RequestBody Map<String, Object> payload,
                                    HttpSession session) {
        // payload 맵에서 값을 추출합니다.
        String email = (String) payload.get("email");
        String membershipCode = (String) payload.get("membership");
        // amount는 Integer 또는 Double 등으로 전달될 수 있으므로 Number로 처리
        Number amountNumber = (Number) payload.get("amount");
        int amount = amountNumber != null ? amountNumber.intValue() : 0;

        JSONObject response = new JSONObject();
        Result result = this.userService.updateMembership(email, membershipCode, amount);
        response.put("result", result.nameToLower());

        // 멤버십 갱신 성공 시 세션에 저장된 signedUser 정보도 새로 고침
        if (result == CommonResult.SUCCESS && email != null) {
            UserEntity updatedUser = this.userMapper.selectByEmail(email);
            if (updatedUser != null) {
                session.setAttribute("signedUser", updatedUser);
            }
        }
        return response.toString();
    }
}
