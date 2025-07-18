package com.yjb.jiujitsumembership.controllers;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping(value = "/")
public class ReservationController {

    @RequestMapping(value = "/reservation", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex() {
        return "home/index";
    }
}
