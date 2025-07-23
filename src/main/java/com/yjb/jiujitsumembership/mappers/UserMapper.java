package com.yjb.jiujitsumembership.mappers;

import com.yjb.jiujitsumembership.dtoes.UserDto;
import com.yjb.jiujitsumembership.entities.MembershipEntity;
import com.yjb.jiujitsumembership.entities.PromotionHistoryEntity;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.vos.UserListVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface UserMapper {
    UserEntity selectByEmail(@Param(value = "email")String email);

    int insert(@Param(value = "user") UserEntity user);

    int selectCountByEmail(@Param(value = "email")String email);

    int selectCountByContact(@Param(value = "contact")String contact);

    int updateGymId(@Param(value = "user")UserEntity user);

    int insertPromotionHistory(@Param(value = "promotion")PromotionHistoryEntity promotion);

    UserDto selectUserDtoByEmail(@Param(value = "email")String email);

    int update(@Param(value = "user") UserEntity user);

    List<UserListVo> selectAllForAdmin();

    List<UserListVo> selectForUser(@Param(value = "email")String email);

    List<UserListVo> searchForUserPage(@Param("email") String email,
                                       @Param("name") String name,
                                       @Param("offset") int offset,
                                       @Param("limit") int limit);

    int countForUserSearch(@Param("email") String email,
                           @Param("name") String name);

    MembershipEntity selectByCode(@Param(value = "membershipCode")String membershipCode);

    int updateMembershipDate(UserListVo userListVo);

    int updateUserBeltAndPromotion(@Param(value = "email")String email,
                                   @Param(value = "belt") String belt,
                                   @Param(value = "promotion")LocalDate promotion);

    int updateIsDeleted(@Param(value = "email") String email,
                        @Param(value = "isDeleted")boolean isDeleted);

    List<UserListVo> selectForUserPage(@Param(value = "email") String email,
                                       @Param(value = "offset") int offset,
                                       @Param(value = "limit") int limit);

    int countForUser(@Param(value = "email") String email);

    int updateMembership(@Param(value = "email") String email,
                         @Param(value = "membership") String membership,
                         @Param(value = "joinedDate") LocalDate joinedDate,
                         @Param(value = "expireDate") LocalDate expireDate);
}
