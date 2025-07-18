package com.yjb.jiujitsumembership.controllers.myPage;

import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.results.ResultTuple;
import com.yjb.jiujitsumembership.services.UserService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/user/myPage")
public class UserModifyController {
    private final UserService userService;

    @Autowired
    public UserModifyController(UserService userService) {
        this.userService = userService;
    }


    @RequestMapping(value = "/modify", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getModify() {
        return "fragments/myPage/userModify";
    }

    @RequestMapping(value = "/modify", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchModify(@SessionAttribute(value = "signedUser")UserEntity user,
                              @RequestParam(value = "password")String password,
                              @RequestParam(value = "newPassword", required = false)String newPassword,
                              @RequestParam(value = "contact", required = false)String contact,
                              @RequestParam(value = "newContact", required = false)String newContact,
                              @RequestParam(value = "addressPostal", required = false)String addressPostal,
                              @RequestParam(value = "addressPrimary", required = false)String addressPrimary,
                              @RequestParam(value = "addressSecondary", required = false)String addressSecondary) {
        ResultTuple<UserEntity> result = this.userService.modify(user, password, newPassword, contact, newContact, addressPostal, addressPrimary, addressSecondary);
        JSONObject response = new JSONObject();
        response.put("result", result.getResult().name().toLowerCase());

        return response.toString();
    }
}