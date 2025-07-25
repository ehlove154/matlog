package com.yjb.jiujitsumembership.controllers;

import com.yjb.jiujitsumembership.dtoes.UserDto;
import com.yjb.jiujitsumembership.entities.ClassEntity;
import com.yjb.jiujitsumembership.entities.GymEntity;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.mappers.GymMapper;
import com.yjb.jiujitsumembership.mappers.UserMapper;
import com.yjb.jiujitsumembership.results.CommonResult;
import com.yjb.jiujitsumembership.results.Result;
import com.yjb.jiujitsumembership.results.ResultTuple;
import com.yjb.jiujitsumembership.services.ClassService;
import com.yjb.jiujitsumembership.services.ReservationService;
import com.yjb.jiujitsumembership.services.UserService;
import com.yjb.jiujitsumembership.vos.PageVo;
import com.yjb.jiujitsumembership.vos.UserListVo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.LinkedHashMap;

@Controller
@RequestMapping(value = "/user")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final GymMapper gymMapper;
    private final ClassService classService;
    private final ReservationService reservationService;

    @Autowired
    public UserController(UserService userService, UserMapper userMapper, GymMapper gymMapper, ClassService classService, ReservationService reservationService) {
        this.userService = userService;
        this.userMapper = userMapper;
        this.gymMapper = gymMapper;
        this.classService = classService;
        this.reservationService = reservationService;
    }

    @RequestMapping(value = "/check-email", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postCheckEmail(@RequestParam(value = "email", required = false) String email) {
        Result result = this.userService.isEmailAvailable(email); // 이메일 중복 체크
        JSONObject response = new JSONObject();
        response.put("result", result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/check-contact", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postCheckContact(@RequestParam(value = "contact", required = false) String contact) {
        Result result = this.userService.isContactAvailable(contact); // 연락처 중복 체크
        JSONObject response = new JSONObject();
        response.put("result", result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/register", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex(Model model) { // 회원가입
        List<GymEntity> gyms = gymMapper.findAllActive();
        model.addAttribute("gyms", gyms);
        return "user/register";
    }

    @RequestMapping(value = "/register", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRegister(UserEntity user, HttpServletRequest request) {
        JSONObject response = new JSONObject();

        // ✅ 1. 중복 검사 먼저
        if (userMapper.selectCountByEmail(user.getEmail()) > 0) {
            response.put("result", "failure");
            response.put("message", "이메일이 이미 사용 중입니다.");
            return response.toString();
        }

        if (userMapper.selectCountByContact(user.getContact()) > 0) {
            response.put("result", "failure");
            response.put("message", "연락처가 이미 사용 중입니다.");
            return response.toString();
        }

        // ✅ 2. insert
        user.setLastSignedUa(request.getHeader("User-Agent"));
        Result result = this.userService.register(user);

        response.put("result", result.nameToLower());
        return response.toString();
    }

    @RequestMapping(value = "/login", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getLogin() {
        return "user/login";
    }

    @RequestMapping(value = "/login", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postLogin(@RequestParam(value = "email", required = false) String email,
                            @RequestParam(value = "password", required = false) String password,
                            HttpSession session) {
        ResultTuple<UserEntity> resultTuple = this.userService.login(email, password);
        JSONObject response = new JSONObject();
        response.put("result", resultTuple.getResult().nameToLower());

        if (resultTuple.getResult() == CommonResult.SUCCESS) {
            UserEntity signedUser = resultTuple.getPayload();
            session.setAttribute("signedUser", signedUser);

            UserDto userDto = this.userMapper.selectUserDtoByEmail(email);
            if (userDto != null) {
                // beltWithStripe 계산
                int stripe = userDto.getStripeCount() != null ? userDto.getStripeCount() : 0;
                if (stripe > 0) {
                    userDto.setBeltWithStripe(userDto.getDisplayText() + " " + userDto.getStripeCount() + "그랄");
                } else {
                    userDto.setBeltWithStripe(userDto.getDisplayText() + " " + "무그랄");
                }
                System.out.println("gymName = " + userDto.getGymName());
            }
            session.setAttribute("userDto", userDto);
        }
        return response.toString();
    }

    @RequestMapping(value = "/recover", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getRecover() {
        return "user/recover";
    }

    @RequestMapping(value = "/myPage", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getMyPage(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                            @SessionAttribute(value = "userDto", required = false) UserDto userDto,
                            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
                            @RequestParam(value = "name", required = false) String name,
                            @RequestParam(value = "day", required = false, defaultValue = "MON") String day,
                            Model model) {

        if (signedUser == null) {
            return "redirect:/user/login";
        }

        model.addAttribute("signedUser", signedUser);
        model.addAttribute("userDto", userDto);

        // 체육관 정보 조회
        GymEntity gym = null;
        if (userDto != null && userDto.getEmail() != null) {
            gym = this.gymMapper.selectByEmail(userDto.getEmail());
        }
        if (gym == null) {
            gym = new GymEntity(); // 기본값을 가진 빈 객체
        }
        model.addAttribute("gym", gym);
        model.addAttribute("day", day);

        int totalReserved = this.reservationService.getReservationCountByEmail(signedUser.getEmail());
        model.addAttribute("totalReserved", totalReserved);

        List<ClassEntity> sessions = this.classService.getSessions(signedUser);
        Map<String, List<ClassEntity>> sessionsByDay = sessions.stream()
                .collect(Collectors.groupingBy(ClassEntity::getDay, LinkedHashMap::new, Collectors.toList()));
        model.addAttribute("sessionsByDay", sessionsByDay);

        PageVo pageVo;
        List<UserListVo> userList;
        if (name != null && !name.isBlank()) {
            pageVo = this.userService.getSearchPageVo(signedUser.getEmail(), name, page);
            userList = this.userService.searchUsers(signedUser.getEmail(), name, pageVo);
            model.addAttribute("keyword", name);
        } else {
            pageVo = this.userService.getUserPageVo(signedUser.getEmail(), page);
            userList = this.userService.getUsersByPage(signedUser.getEmail(), pageVo);
        }

        model.addAttribute("userList", userList);
        model.addAttribute("pageVo", pageVo);

        return "user/myPage";
    }

    @PostMapping(value = "/membership", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postMembership(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                 @RequestParam(value = "membership", required = false) String membership,
                                 HttpSession session) {
        JSONObject response = new JSONObject();

        if (signedUser == null) {
            response.put("result", CommonResult.FAILURE_SESSION_EXPIRED.nameToLower());
            return response.toString();
        }

        if (membership == null || membership.isBlank()) {
            response.put("result", CommonResult.FAILURE.nameToLower());
            return response.toString();
        }

        UserListVo vo = UserListVo.builder()
                .email(signedUser.getEmail())
                .membership(membership)
                .build();

        this.userService.registerMembership(vo);
        this.userMapper.updateMembershipDate(vo);

        signedUser.setMembership(membership);
        signedUser.setMembershipJoinedDate(vo.getJoinedDate());
        signedUser.setMembershipExpireDate(vo.getExpireDate());
        session.setAttribute("signedUser", signedUser);

        response.put("result", CommonResult.SUCCESS.nameToLower());
        response.put("membership", membership);
        response.put("joinedDate", vo.getJoinedDate());
        response.put("expireDate", vo.getExpireDate());
        return response.toString();
    }

}
