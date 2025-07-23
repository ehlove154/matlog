package com.yjb.jiujitsumembership.controllers.myPage;

import com.yjb.jiujitsumembership.dtoes.UserSessionDto;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.results.CommonResult;
import com.yjb.jiujitsumembership.services.ReservationService;
import com.yjb.jiujitsumembership.vos.PageVo;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;

import java.util.List;

@Controller
@RequestMapping("/user/myPage")
public class SessionReservationController {
    private final ReservationService reservationService;

    @Autowired
    public SessionReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping(value = "/reservations", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getReservations(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                  @RequestParam(value = "page", required = false, defaultValue = "1") int page) {
        JSONObject response = new JSONObject();
        if (signedUser == null) {
            response.put("result", CommonResult.FAILURE_SESSION_EXPIRED.name().toLowerCase());
            return response.toString();
        }
        PageVo pageVo = this.reservationService.getUserReservationPageVo(signedUser.getEmail(), page);
        List<UserSessionDto> list = this.reservationService.getUserReservations(signedUser.getEmail(), pageVo);
        JSONArray arr = new JSONArray();
        for (UserSessionDto dto : list) {
            JSONObject obj = new JSONObject();
            obj.put("reservationId", dto.getReservationId());
            obj.put("userEmail", dto.getUserEmail());
            obj.put("classId", dto.getClassId());
            obj.put("reservedAt", dto.getReservedAt() != null ? dto.getReservedAt().toString() : JSONObject.NULL);
            obj.put("isAttended", dto.isAttended());
            obj.put("attendedAt", dto.getAttendedAt() != null ? dto.getAttendedAt().toString() : JSONObject.NULL);
            obj.put("className", dto.getClassName());
            obj.put("coach", dto.getCoach());
            obj.put("startTime", dto.getStartTime() != null ? dto.getStartTime().toString() : JSONObject.NULL);
            obj.put("endTime", dto.getEndTime() != null ? dto.getEndTime().toString() : JSONObject.NULL);
            obj.put("day", dto.getDay());
            arr.put(obj);
        }
        response.put("result", "success");
        response.put("page", pageVo.page);
        response.put("maxPage", pageVo.maxPage);
        response.put("reservations", arr);
        return response.toString();
    }
}