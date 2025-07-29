package com.yjb.jiujitsumembership.controllers;

import com.yjb.jiujitsumembership.dtoes.ReservationDto;
import com.yjb.jiujitsumembership.dtoes.UserDto;
import com.yjb.jiujitsumembership.entities.ClassReservationEntity;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.results.CommonResult;
import com.yjb.jiujitsumembership.results.ResultTuple;
import com.yjb.jiujitsumembership.services.ReservationService;
import com.yjb.jiujitsumembership.vos.PageVo;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Controller
@RequestMapping(value = "/")
public class BookController {

    private final ReservationService reservationService;

    @Autowired
    public BookController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @RequestMapping(value = "/book/reservations", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getReservations(@RequestParam(value = "classId", required = false) Integer classId,
                                  @RequestParam(value = "email", required = false) String email,
                                  @RequestParam(value = "page", required = false, defaultValue = "1") int page) {
        JSONObject response = new JSONObject();
        if (classId == null) {
            response.put("result", "failure");
            return response.toString();
        }
        PageVo pageVo = this.reservationService.getReservationPageVo(classId, email, page);
        JSONArray reservations = new JSONArray();
        for (ReservationDto dto : this.reservationService.getReservationsByPage(classId, email, pageVo)) {
            JSONObject attendee = new JSONObject();
            attendee.put("reservationId", dto.getReservationId());
            attendee.put("email", dto.getEmail());
            attendee.put("name", dto.getName());
            attendee.put("belt", dto.getBelt());
            attendee.put("displayText", dto.getDisplayText());
            attendee.put("stripeCount", dto.getStripeCount());
            attendee.put("beltWithStripe", dto.getBeltWithStripe());
            attendee.put("isAttended", dto.isAttended());
            response.put("page", pageVo.page);
            response.put("maxPage", pageVo.maxPage);
            reservations.put(attendee);
        }
        response.put("result", "success");
        response.put("reservations", reservations);
        return response.toString();
    }

    @RequestMapping(value = "/book", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex(@RequestParam(value = "className", required = false) String className,
                           @RequestParam(value = "date", required = false)String date,
                           @RequestParam(value = "day", required = false) String day,
                           @RequestParam(value = "start", required = false)String start,
                           @RequestParam(value = "end", required = false)String end,
                           @RequestParam(value = "coach", required = false)String coach,
                           Model model) {
        model.addAttribute("className", className);
        model.addAttribute("date", date);
        model.addAttribute("day", day);
        if (start != null && end != null) {
            model.addAttribute("time", start + " - " + end);
        }
        model.addAttribute("coach", coach);
        return "/book";
    }

    @RequestMapping(value = "/book/reserve", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postReserve(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                              @RequestParam(value = "classId", required = false) Integer classId,
                              @RequestParam(value = "date", required = false) String date) {
        JSONObject response = new JSONObject();
        LocalDateTime sessionDate = null;
        if (date != null && !date.isBlank()) {
            try {
                sessionDate = LocalDate.parse(date).atStartOfDay();
            } catch (Exception ignored) {
                try {
                    sessionDate = LocalDateTime.parse(date);
                } catch (Exception ignored2) {
                    sessionDate = null;
                }
            }
        }
        ResultTuple<ReservationDto> result = this.reservationService.reserve(classId == null ? 0 : classId, signedUser, sessionDate);
        if (result.getResult() == CommonResult.FAILURE_MEMBERSHIP_REQUIRED) {
            response.put("result", "membership_required");
            return response.toString();
        }
        response.put("result", result.getResult().nameToLower());

        if (result.getResult() == CommonResult.SUCCESS && result.getPayload() != null) {
            ReservationDto dto = result.getPayload();
            JSONObject attendee = new JSONObject();
            attendee.put("reservationId", dto.getReservationId());
            attendee.put("email", dto.getEmail());
            attendee.put("name", dto.getName());
            attendee.put("belt", dto.getBelt());
            attendee.put("displayText", dto.getDisplayText());
            attendee.put("stripeCount", dto.getStripeCount());
            attendee.put("beltWithStripe", dto.getBeltWithStripe());
            response.put("attendee", attendee);
        }
        return response.toString();
    }

    @PostMapping(value = "/book/attendance", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postAttendance(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                 @RequestParam(value = "reservationId", required = false) Integer reservationId,
                                 @RequestParam(value = "attended", required = false) Boolean attended) {
        JSONObject response = new JSONObject();

        if (signedUser == null || !"MASTER".equalsIgnoreCase(signedUser.getUserRole())) {
            response.put("result", "unauthorized");
            return response.toString();
        }

        CommonResult result = this.reservationService.updateAttendance(reservationId == null ? 0 : reservationId,
                attended != null && attended);
        response.put("result", result.name().toLowerCase());
        return response.toString();
    }

    @PostMapping(value = "/book/cancel", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postCancel(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                             @RequestParam(value = "reservationId", required = false) Integer reservationId) {
        JSONObject response = new JSONObject();
        CommonResult result = this.reservationService.cancelReservation(reservationId == null ? 0 : reservationId,
                signedUser);
        response.put("result", result.name().toLowerCase());
        return response.toString();
    }

    @GetMapping(value = "/book/reservation", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getReservation(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                 @RequestParam(value = "classId", required = false) Integer classId) {
        JSONObject response = new JSONObject();
        if (signedUser == null || classId == null) {
            response.put("result", "failure");
            return response.toString();
        }
        ReservationDto dto = this.reservationService.getReservationByUser(classId, signedUser.getEmail());
        if (dto != null) {
            response.put("result", "success");
            response.put("reservationId", dto.getReservationId());
        } else {
            response.put("result", "none");
        }
        return response.toString();
    }

}
