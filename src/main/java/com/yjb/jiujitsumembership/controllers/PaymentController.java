package com.yjb.jiujitsumembership.controllers;

import com.yjb.jiujitsumembership.results.Result;
import com.yjb.jiujitsumembership.services.UserService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class PaymentController {
    private final UserService userService;

    @Autowired
    public PaymentController(UserService userService) {
        this.userService = userService;
    }

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
}