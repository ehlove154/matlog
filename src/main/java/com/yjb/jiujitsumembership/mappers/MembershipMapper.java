package com.yjb.jiujitsumembership.mappers;

import com.yjb.jiujitsumembership.entities.MembershipEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MembershipMapper {
    List<MembershipEntity> selectAll();

    int insert(@Param(value = "membership") MembershipEntity membership);

    int update(@Param(value = "membership") MembershipEntity membership);

    int deleteByCode(@Param(value = "membershipCode") String membershipCode);
}