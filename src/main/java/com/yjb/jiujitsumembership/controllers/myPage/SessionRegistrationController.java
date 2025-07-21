package com.yjb.jiujitsumembership.controllers.myPage;

import com.yjb.jiujitsumembership.entities.ClassEntity;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.results.Result;
import com.yjb.jiujitsumembership.services.ClassService;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/user/myPage")
public class SessionRegistrationController {
    private final ClassService classService;

    @Autowired
    public SessionRegistrationController(ClassService classService) {
        this.classService = classService;
    }

    @PatchMapping(value = "/sessionRegistration", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchSessionRegistration(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser,
                                           @RequestBody(required = false) List<ClassEntity> sessions) {
        Result result = classService.saveSessions(signedUser, sessions);
        JSONObject response = new JSONObject();
        response.put("result", result.name().toLowerCase());
        return response.toString();
    }

    @GetMapping(value = "/classes", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getClasses(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        List<ClassEntity> sessions = this.classService.getSessions(signedUser);
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

    @GetMapping(value = "/classes/all", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getAllClasses(@SessionAttribute(value = "signedUser", required = false) UserEntity signedUser) {
        JSONObject response = new JSONObject();

        if (signedUser == null) {
            response.put("result", "failure_session_expired");
            return response.toString();
        }
        if (!"MASTER".equalsIgnoreCase(signedUser.getUserRole())) {
            response.put("result", "unauthorized");
            return response.toString();
        }

        List<ClassEntity> sessions = this.classService.getAllSessions();
        Map<String, List<ClassEntity>> byDay = sessions.stream()
                .collect(Collectors.groupingBy(ClassEntity::getDay, LinkedHashMap::new, Collectors.toList()));

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