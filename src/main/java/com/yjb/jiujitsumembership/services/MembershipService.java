package com.yjb.jiujitsumembership.services;

import com.yjb.jiujitsumembership.entities.MembershipEntity;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.mappers.MembershipMapper;
import com.yjb.jiujitsumembership.results.CommonResult;
import com.yjb.jiujitsumembership.results.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MembershipService {
    private final MembershipMapper membershipMapper;

    @Autowired
    public MembershipService(MembershipMapper membershipMapper) {
        this.membershipMapper = membershipMapper;
    }

    public List<MembershipEntity> getAllMemberships() {
        return this.membershipMapper.selectAll();
    }

    public Result saveMemberships(UserEntity signedUser, List<MembershipEntity> memberships) {
        if (signedUser == null) {
            return CommonResult.FAILURE_SESSION_EXPIRED;
        }
        if (!"MASTER".equalsIgnoreCase(signedUser.getUserRole())) {
            return CommonResult.FAILURE;
        }
        if (memberships == null || memberships.isEmpty()) {
            return CommonResult.SUCCESS;
        }

        for (MembershipEntity membership : memberships) {
            if (membership.getMembershipCode() != null && !membership.getMembershipCode().isBlank()) {
                if (membership.isDeleted()) {
                    membershipMapper.deleteByCode(membership.getMembershipCode());
                } else {
                    membershipMapper.update(membership);
                }
            } else {
                membershipMapper.insert(membership);
            }
        }
        return CommonResult.SUCCESS;
    }
}