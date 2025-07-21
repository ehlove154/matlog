package com.yjb.jiujitsumembership.controllers.myPage;

import com.yjb.jiujitsumembership.entities.ClassEntity;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.results.Result;
import com.yjb.jiujitsumembership.services.ClassService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/user/myPage")
public class SessionRegistrationController {
    private final ClassService classService;

    @Autowired
    public SessionRegistrationController(ClassService classService) {
        this.classService = classService;
    }

    @PatchMapping(value = "/sessionRegistration", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchSessionRegistration(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                           @RequestBody(required = false) List<ClassEntity> sessions) {
        Result result = classService.saveSessions(signedUser, sessions);
        JSONObject response = new JSONObject();
        response.put("result", result.name().toLowerCase());
        return response.toString();
    }
}