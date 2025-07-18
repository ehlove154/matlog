package com.yjb.jiujitsumembership.controllers.myPage;

import com.yjb.jiujitsumembership.entities.GymEntity;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.results.ResultTuple;
import com.yjb.jiujitsumembership.services.UserService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value = "/user/myPage")
public class GymInfoController {

    private final UserService userService;

    @Autowired
    public GymInfoController(UserService userService) {
        this.userService = userService;
    }

    @RequestMapping(value = "/gymInfo", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getGymInfo() {
        return "fragments/myPage/gymInfo";
    }

    @RequestMapping(value = "/gymInfo", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResultTuple<GymEntity> patchGymInfo(@SessionAttribute(value = "signedUser") UserEntity signedUser,
                               @RequestParam(value = "gymName", required = false) String gymName,
                               @RequestParam(value = "addressPostal", required = false) String addressPostal,
                               @RequestParam(value = "addressPrimary", required = false) String addressPrimary,
                               @RequestParam(value = "addressSecondary", required = false) String addressSecondary,
                               @RequestParam(value = "isActive", required = false) Boolean isActive) {

        ResultTuple<GymEntity> result = this.userService.gymInfo(signedUser, gymName, addressPostal, addressPrimary, addressSecondary, isActive);
        JSONObject response = new JSONObject();
        response.put("result", result.getResult().name().toLowerCase());
        return result;
    }
}