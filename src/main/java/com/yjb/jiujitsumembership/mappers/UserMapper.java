package com.yjb.jiujitsumembership;

import com.yjb.jiujitsumembership.entities.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    UserEntity selectByEmail(@Param(value = "email")String email);
}
