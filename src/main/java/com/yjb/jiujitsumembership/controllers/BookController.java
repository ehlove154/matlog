package com.yjb.jiujitsumembership.controllers;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping(value = "/")
public class BookController {

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
}
