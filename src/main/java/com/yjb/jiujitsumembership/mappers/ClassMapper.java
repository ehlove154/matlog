package com.yjb.jiujitsumembership.mappers;

import com.yjb.jiujitsumembership.entities.ClassEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ClassMapper {
    int insert(@Param(value = "clazz") ClassEntity clazz);

    int update(@Param(value = "clazz") ClassEntity clazz);

    List<ClassEntity> selectByUserEmail(@Param(value = "email") String email);

    List<ClassEntity> selectAll();

    int updateDeleted(@Param(value = "classId") int classId);

    int deleteById(@Param(value = "classId") int classId);
}