package com.yjb.jiujitsumembership.services;

import com.yjb.jiujitsumembership.entities.ClassEntity;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.mappers.ClassMapper;
import com.yjb.jiujitsumembership.results.CommonResult;
import com.yjb.jiujitsumembership.results.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassService {
    private final ClassMapper classMapper;

    @Autowired
    public ClassService(ClassMapper classMapper) {
        this.classMapper = classMapper;
    }

    public Result saveSessions(UserEntity signedUser, List<ClassEntity> sessions) {
        if (signedUser == null) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        if (!"MASTER".equalsIgnoreCase(signedUser.getUserRole())) {
            return CommonResult.FAILURE;
        }
        if (sessions == null || sessions.isEmpty()) {
            return CommonResult.SUCCESS;
        }
        for (ClassEntity session : sessions) {
            session.setUserEmail(signedUser.getEmail());
            if (signedUser.getGymId() != null) {
                session.setGymId(signedUser.getGymId());
            }
            if (session.getClassId() > 0) {
                classMapper.update(session);
            } else {
                classMapper.insert(session);
            }
        }
        return CommonResult.SUCCESS;
    }

    public List<ClassEntity> getSessions(UserEntity signedUser) {
        if (signedUser == null) {
            return List.of();
        }
        return this.classMapper.selectByUserEmail(signedUser.getEmail());
    }
}