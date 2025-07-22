package com.yjb.jiujitsumembership.controllers;

import com.yjb.jiujitsumembership.entities.ClassEntity;
import com.yjb.jiujitsumembership.services.ClassService;
import jakarta.servlet.http.HttpSession;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping(value = "/")
public class HomeController {

    private final ClassService classService;

    @Autowired
    public HomeController(ClassService classService) {
        this.classService = classService;
    }

    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getIndex() {
        return "home/index";
    }

    @RequestMapping(value = "/user_logout", method = RequestMethod.GET)
    public String getUserLogout(HttpSession session) {
        session.setAttribute("signedUser", null);
        return "redirect:/";
    }

    @RequestMapping(value = "/classes", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getClasses() {
        List<ClassEntity> sessions = this.classService.getAllSessions();
        Map<String, List<ClassEntity>> byDay = sessions.stream()
                .collect(Collectors.groupingBy(ClassEntity::getDay, LinkedHashMap::new, Collectors.toList()));
        JSONObject response = new JSONObject();
        byDay.forEach((day, list) -> {
            JSONArray arr = new JSONArray();
            list.forEach(session -> {
                JSONObject obj = new JSONObject();
                obj.put("classId", session.getClassId());
                obj.put("className", session.getClassName());
                obj.put("coach", session.getCoach());
                obj.put("startTime", session.getStartTime());
                obj.put("endTime", session.getEndTime());
                obj.put("day", session.getDay());
                arr.put(obj);
            });
            response.put(day, arr);
        });
        return response.toString();
    }
}
