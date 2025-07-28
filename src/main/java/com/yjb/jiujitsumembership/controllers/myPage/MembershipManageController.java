package com.yjb.jiujitsumembership.controllers.myPage;

import com.yjb.jiujitsumembership.entities.MembershipEntity;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.results.Result;
import com.yjb.jiujitsumembership.services.MembershipService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;

import java.util.List;

@Controller
@RequestMapping("/user/myPage")
public class MembershipManageController {
    private final MembershipService membershipService;

    @Autowired
    public MembershipManageController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @PatchMapping(value = "/memberships",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchMemberships(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                   @RequestBody(required = false) List<MembershipEntity> memberships) {
        Result result = this.membershipService.saveMemberships(signedUser, memberships);
        JSONObject response = new JSONObject();
        response.put("result", result.name().toLowerCase());
        return response.toString();
    }
}