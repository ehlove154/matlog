package com.yjb.jiujitsumembership.mappers;

import com.yjb.jiujitsumembership.entities.ClassReservationEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ClassReservationMapper {
    int insert(@Param(value = "reservation") ClassReservationEntity reservation);

    int update(@Param(value = "reservation") ClassReservationEntity reservation);

    int updateAttendance(@Param(value = "reservation") ClassReservationEntity reservation);

    int updateDeleted(@Param(value = "reservationId") int reservationId);

    int deleteById(@Param(value = "reservationId") int reservationId);

    List<ClassReservationEntity> selectByClassId(@Param(value = "classId") int classId,
                                                 @Param(value = "email") String email);

    int selectCountByUserAndClassId(@Param(value = "userEmail") String userEmail,
                                    @Param(value = "classId") int classId);

    ClassReservationEntity selectById(@Param(value = "reservationId") int reservationId);

    int updateDeletedReservation(@Param(value = "reservationId") int reservationId,
                      @Param(value = "email") String email);
}