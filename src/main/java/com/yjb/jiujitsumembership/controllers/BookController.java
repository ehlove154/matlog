package com.yjb.jiujitsumembership.controllers;

import com.yjb.jiujitsumembership.dtoes.UserDto;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.results.CommonResult;
import com.yjb.jiujitsumembership.results.ResultTuple;
import com.yjb.jiujitsumembership.services.ReservationService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value = "/")
public class BookController {

    private final ReservationService reservationService;

    @Autowired
    public BookController(ReservationService reservationService) {
        this.reservationService = reservationService;
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
                              @RequestParam(value = "classId", required = false) Integer classId) {
        JSONObject response = new JSONObject();
        ResultTuple<UserDto> result = this.reservationService.reserve(classId == null ? 0 : classId, signedUser);
        response.put("result", result.getResult().nameToLower());

        if (result.getResult() == CommonResult.SUCCESS && result.getPayload() != null) {
            UserDto dto = result.getPayload();
            JSONObject attendee = new JSONObject();
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
}
