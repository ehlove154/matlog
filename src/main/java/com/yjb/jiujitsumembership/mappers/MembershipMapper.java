package com.yjb.jiujitsumembership.mappers;

import com.yjb.jiujitsumembership.entities.MembershipEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MembershipMapper {
    List<MembershipEntity> selectAll();
}