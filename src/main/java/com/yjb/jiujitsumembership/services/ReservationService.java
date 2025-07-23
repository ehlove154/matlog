package com.yjb.jiujitsumembership.services;

import com.yjb.jiujitsumembership.dtoes.ReservationDto;
import com.yjb.jiujitsumembership.dtoes.UserDto;
import com.yjb.jiujitsumembership.entities.ClassReservationEntity;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.mappers.ClassReservationMapper;
import com.yjb.jiujitsumembership.mappers.UserMapper;
import com.yjb.jiujitsumembership.results.CommonResult;
import com.yjb.jiujitsumembership.results.ResultTuple;
import com.yjb.jiujitsumembership.vos.PageVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReservationService {
    private final ClassReservationMapper reservationMapper;
    private final UserMapper userMapper;

    @Autowired
    public ReservationService(ClassReservationMapper reservationMapper, UserMapper userMapper) {
        this.reservationMapper = reservationMapper;
        this.userMapper = userMapper;
    }

    public List<ClassReservationEntity> getReservationEntities(int classId, String email) {
        if (classId <= 0) {
            return List.of();
        }
        return this.reservationMapper.selectByClassId(classId, email);
    }

    public PageVo getReservationPageVo(int classId, String email, int page) {
        if (classId <= 0) {
            return new PageVo(10, 1, 0);
        }
        int totalCount = this.reservationMapper.countByClassId(classId, email);
        return new PageVo(10, page, totalCount);
    }

    public List<ReservationDto> getReservationsByPage(int classId, String email, PageVo pageVo) {
        if (classId <= 0 || pageVo.totalCount == 0) {
            return List.of();
        }
        List<ClassReservationEntity> entities = this.reservationMapper.selectByClassIdPage(classId, email, pageVo.rowCount, pageVo.dbOffset);
        return convertEntitiesToDtos(entities);
    }

    private List<ReservationDto> convertEntitiesToDtos(List<ClassReservationEntity> entities) {
        if (entities == null || entities.isEmpty()) {
            return List.of();
        }
        List<ReservationDto> reservations = new ArrayList<>();
        for (ClassReservationEntity entity : entities) {
            UserDto userDto = this.userMapper.selectUserDtoByEmail(entity.getUserEmail());
            if (userDto == null) continue;
            int stripe = userDto.getStripeCount() != null ? userDto.getStripeCount() : 0;
            String beltWithStripe = userDto.getDisplayText();
            if (beltWithStripe == null) beltWithStripe = "";
            beltWithStripe += stripe > 0 ? " " + stripe + "그랄" : " 무그랄";

            ReservationDto dto = ReservationDto.builder()
                    .reservationId(entity.getReservationId())
                    .email(userDto.getEmail())
                    .name(userDto.getName())
                    .belt(userDto.getBelt())
                    .displayText(userDto.getDisplayText())
                    .stripeCount(userDto.getStripeCount())
                    .beltWithStripe(beltWithStripe)
                    .isAttended(entity.isAttended())
                    .build();
            reservations.add(dto);
        }
        return reservations;
    }

    public ResultTuple<ReservationDto> reserve(int classId, UserEntity signedUser) {
        if (signedUser == null) {
            return ResultTuple.<ReservationDto>builder().result(CommonResult.FAILURE_SESSION_EXPIRED).build();
        }
        if (classId <= 0) {
            return ResultTuple.<ReservationDto>builder().result(CommonResult.FAILURE).build();
        }

        if (this.reservationMapper.selectCountByUserAndClassId(signedUser.getEmail(), classId) > 0) {
            return ResultTuple.<ReservationDto>builder()
                    .result(CommonResult.FAILURE_DUPLICATE_RESERVATION)
                    .build();
        }

        if ("NONE".equalsIgnoreCase(signedUser.getMembership()) ||
                (signedUser.getMembershipExpireDate() != null &&
                        signedUser.getMembershipExpireDate().isBefore(java.time.LocalDate.now()))) {
            return ResultTuple.<ReservationDto>builder()
                    .result(CommonResult.FAILURE_MEMBERSHIP_REQUIRED)
                    .build();
        }

        ClassReservationEntity entity = ClassReservationEntity.builder()
                .userEmail(signedUser.getEmail())
                .classId(classId)
                .reservedAt(LocalDateTime.now())
                .isAttended(false)
                .build();

        int affected = reservationMapper.insert(entity);
        if (affected == 0) {
            return ResultTuple.<ReservationDto>builder().result(CommonResult.FAILURE).build();
        }

        UserDto userDto = userMapper.selectUserDtoByEmail(signedUser.getEmail());
        if (userDto == null) {
            return ResultTuple.<ReservationDto>builder().result(CommonResult.FAILURE).build();
        }

        ReservationDto dto = ReservationDto.builder()
                .reservationId(entity.getReservationId())
                .email(userDto.getEmail())
                .name(userDto.getName())
                .belt(userDto.getBelt())
                .displayText(userDto.getDisplayText())
                .stripeCount(userDto.getStripeCount())
                .beltWithStripe(userDto.getBeltWithStripe())
                .isAttended(false)
                .build();

        return ResultTuple.<ReservationDto>builder().payload(dto).result(CommonResult.SUCCESS).build();
    }

    public CommonResult updateAttendance(int reservationId, boolean attended) {
        ClassReservationEntity entity = ClassReservationEntity.builder()
                .reservationId(reservationId)
                .isAttended(attended)
                .attendedAt(attended ? LocalDateTime.now() : null)
                .build();

        int affected = this.reservationMapper.updateAttendance(entity);
        return affected > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    public List<ReservationDto> getReservations(int classId, String email) {
        if (classId <= 0) {
            return List.of();
        }
        List<ClassReservationEntity> entities = this.reservationMapper.selectByClassId(classId, email);
        return convertEntitiesToDtos(entities);
    }

    public CommonResult cancelReservation(int reservationId, UserEntity user) {
        if (user == null) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        if (reservationId <= 0) {
            return CommonResult.FAILURE;
        }

        String email = null;
        if (!"MASTER".equalsIgnoreCase(user.getUserRole())) {
            email = user.getEmail();
        }

        int affected = this.reservationMapper.updateDeletedReservation(reservationId, email);
        return affected > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    public ReservationDto getReservationByUser(int classId, String email) {
        if (classId <= 0 || email == null) {
            return null;
        }
        ClassReservationEntity entity = this.reservationMapper.selectOneByClassIdAndEmail(classId, email);
        if (entity == null) {
            return null;
        }
        UserDto userDto = this.userMapper.selectUserDtoByEmail(entity.getUserEmail());
        if (userDto == null) {
            return null;
        }
        int stripe = userDto.getStripeCount() != null ? userDto.getStripeCount() : 0;
        String beltWithStripe = userDto.getDisplayText();
        if (beltWithStripe == null) beltWithStripe = "";
        beltWithStripe += stripe > 0 ? " " + stripe + "그랄" : " 무그랄";

        return ReservationDto.builder()
                .reservationId(entity.getReservationId())
                .email(userDto.getEmail())
                .name(userDto.getName())
                .belt(userDto.getBelt())
                .displayText(userDto.getDisplayText())
                .stripeCount(userDto.getStripeCount())
                .beltWithStripe(beltWithStripe)
                .isAttended(entity.isAttended())
                .build();
    }

}