package com.yjb.jiujitsumembership.services;

import com.yjb.jiujitsumembership.entities.MembershipEntity;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.mappers.MembershipMapper;
import com.yjb.jiujitsumembership.results.CommonResult;
import com.yjb.jiujitsumembership.results.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public Result saveMemberships(UserEntity signedUser, List<MembershipEntity> memberships) {
        if (signedUser == null) return CommonResult.FAILURE_SESSION_EXPIRED;
        if (!"MASTER".equalsIgnoreCase(signedUser.getUserRole())) return CommonResult.FAILURE;
        if (memberships == null || memberships.isEmpty()) return CommonResult.SUCCESS;

        for (MembershipEntity membership : memberships) {
            int affected;
            if (membership.getMembershipCode() != null && !membership.getMembershipCode().isBlank()) {
                if (membership.isDeleted()) {
                    affected = membershipMapper.deleteByCode(membership.getMembershipCode());
                } else {
                    affected = membershipMapper.update(membership);
                    // 존재하지 않는 코드면 insert 처리
                    if (affected == 0) {
                        membershipMapper.insert(membership);
                        affected = 1;
                    }
                }
            } else {
                affected = membershipMapper.insert(membership);
            }
            if (affected == 0) {
                return CommonResult.FAILURE;
            }
        }
        return CommonResult.SUCCESS;
    }
}