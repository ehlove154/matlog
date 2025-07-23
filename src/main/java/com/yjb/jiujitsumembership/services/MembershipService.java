package com.yjb.jiujitsumembership.services;

import com.yjb.jiujitsumembership.entities.MembershipEntity;
import com.yjb.jiujitsumembership.mappers.MembershipMapper;
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
}