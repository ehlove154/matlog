package com.yjb.jiujitsumembership.controllers.myPage;

import com.yjb.jiujitsumembership.dtoes.UserDto;
import com.yjb.jiujitsumembership.entities.GymEntity;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.results.CommonResult;
import com.yjb.jiujitsumembership.results.ResultTuple;
import com.yjb.jiujitsumembership.services.UserService;
import jakarta.servlet.http.HttpSession;
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
                                               @SessionAttribute("userDto") UserDto userDto,
                                               @RequestParam(value = "gymName", required = false) String gymName,
                                               @RequestParam(value = "addressPostal", required = false) String addressPostal,
                                               @RequestParam(value = "addressPrimary", required = false) String addressPrimary,
                                               @RequestParam(value = "addressSecondary", required = false) String addressSecondary,
                                               @RequestParam(value = "isActive", required = false) Boolean isActive,
                                               HttpSession session) {

        ResultTuple result = userService.gymInfo(
                signedUser, gymName, addressPostal, addressPrimary, addressSecondary, isActive
        );
        if (result.getResult() == CommonResult.SUCCESS) {
            // 수정된 GymEntity를 받아와 새 이름을 꺼냅니다.
            GymEntity updatedGym = (GymEntity) result.getPayload();
            String newGymName = updatedGym.getGymName();

            // UserDto와 세션 객체 갱신
            signedUser.setGymName(newGymName);
            userDto.setGymName(newGymName);
            session.setAttribute("signedUser", signedUser);
            session.setAttribute("userDto", userDto);
        }
        return result;
    }
}