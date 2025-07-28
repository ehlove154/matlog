package com.yjb.jiujitsumembership.controllers;

import com.yjb.jiujitsumembership.entities.MembershipEntity;
import com.yjb.jiujitsumembership.services.MembershipService;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class MembershipController {
    private final MembershipService membershipService;

    @Autowired
    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @RequestMapping(value = "/memberships", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getMemberships() {
        List<MembershipEntity> memberships = this.membershipService.getAllMemberships();
        JSONArray array = new JSONArray();
        for (MembershipEntity m : memberships) {
            JSONObject obj = new JSONObject();
            obj.put("membershipCode", m.getMembershipCode());
            obj.put("displayText", m.getDisplayText());
            obj.put("durationMonth", m.getDurationDay());
            obj.put("price", m.getPrice());
            array.put(obj);
        }
        return array.toString();
    }
}