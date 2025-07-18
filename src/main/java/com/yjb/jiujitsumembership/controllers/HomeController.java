package com.yjb.jiujitsumembership.controllers;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping(value = "/")
public class HomeController {

    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex() {
        return "home/index";
    }

    @RequestMapping(value = "/user_logout", method = RequestMethod.GET)
    public String getUserLogout(HttpSession session) {
        session.setAttribute("signedUser", null);
        return "redirect:/";
    }
}
