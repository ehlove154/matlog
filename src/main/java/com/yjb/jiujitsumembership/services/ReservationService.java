package com.yjb.jiujitsumembership.services;

import com.yjb.jiujitsumembership.dtoes.UserDto;
import com.yjb.jiujitsumembership.entities.ClassReservationEntity;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.mappers.ClassReservationMapper;
import com.yjb.jiujitsumembership.mappers.UserMapper;
import com.yjb.jiujitsumembership.results.CommonResult;
import com.yjb.jiujitsumembership.results.ResultTuple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ReservationService {
    private final ClassReservationMapper reservationMapper;
    private final UserMapper userMapper;

    @Autowired
    public ReservationService(ClassReservationMapper reservationMapper, UserMapper userMapper) {
        this.reservationMapper = reservationMapper;
        this.userMapper = userMapper;
    }

    public ResultTuple<UserDto> reserve(int classId, UserEntity signedUser) {
        if (signedUser == null) {
            return ResultTuple.<UserDto>builder().result(CommonResult.FAILURE_SESSION_EXPIRED).build();
        }
        if (classId <= 0) {
            return ResultTuple.<UserDto>builder().result(CommonResult.FAILURE).build();
        }

        ClassReservationEntity entity = ClassReservationEntity.builder()
                .userEmail(signedUser.getEmail())
                .classId(classId)
                .reservedAt(LocalDateTime.now())
                .isAttended(false)
                .attendedAt(null)
                .build();

        int affected = reservationMapper.insert(entity);
        if (affected == 0) {
            return ResultTuple.<UserDto>builder().result(CommonResult.FAILURE).build();
        }

        UserDto dto = userMapper.selectUserDtoByEmail(signedUser.getEmail());
        return ResultTuple.<UserDto>builder().payload(dto).result(CommonResult.SUCCESS).build();
    }
}