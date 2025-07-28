package com.yjb.jiujitsumembership.mappers;

import com.yjb.jiujitsumembership.entities.GymEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GymMapper {
    int insert(GymEntity gym);

    GymEntity findById(@Param(value = "gymId")int gymId);

    List<GymEntity> findAllActive();

    GymEntity selectByEmail(@Param(value = "email")String email);

    int update(GymEntity gym);
}
