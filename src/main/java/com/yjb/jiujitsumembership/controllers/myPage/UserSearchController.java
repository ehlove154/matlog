package com.yjb.jiujitsumembership.controllers.myPage;

import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.results.ResultTuple;
import com.yjb.jiujitsumembership.services.UserService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Controller
@RequestMapping("/user/myPage")
public class UserSearchController {
    private final UserService userService;

    @Autowired
    public UserSearchController(UserService userService) {
        this.userService = userService;
    }

    @RequestMapping(value = "/userSearch", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getModify() {
        return "fragments/myPage/userSearch";
    }

    @RequestMapping(value = "/userSearch/modify", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchUserModify(@SessionAttribute(value = "signedUser")UserEntity signedUser,
                                  @RequestParam(value = "target")String targetEmail,
                                  @RequestParam(value = "belt")String belt,
                                  @RequestParam(value = "stripe")int stripe,
                                  @RequestParam(value = "promotion", required = false)@DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate promotion) {
        JSONObject response = new JSONObject();

        if (!"master".equalsIgnoreCase(signedUser.getUserRole())) {
            response.put("result", "unauthorized");
            return response.toString();
        }

        ResultTuple<UserEntity> result = this.userService.userInfoModify(targetEmail, belt, stripe, promotion);

        response.put("result", result.getResult().nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/userSearch/delete", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteUser(@SessionAttribute(value = "signedUser", required = false)UserEntity signedUser,
                             @RequestParam(value = "target", required = false)String targetEmail) {
        return null;
    }
}
