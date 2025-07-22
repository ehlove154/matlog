package com.yjb.jiujitsumembership.mappers;

import com.yjb.jiujitsumembership.entities.ClassReservationEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ClassReservationMapper {
    int insert(@Param(value = "reservation") ClassReservationEntity reservation);

    int update(@Param(value = "reservation") ClassReservationEntity reservation);

    int deleteById(@Param(value = "reservationId") int reservationId);

    List<ClassReservationEntity> selectByClassId(@Param(value = "classId") int classId);
}