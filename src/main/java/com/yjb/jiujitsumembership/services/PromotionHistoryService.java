package com.yjb.jiujitsumembership.services;

import com.yjb.jiujitsumembership.entities.PromotionHistoryEntity;
import com.yjb.jiujitsumembership.mappers.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class PromotionHistoryService {

    private final UserMapper userMapper;

    @Autowired
    public PromotionHistoryService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public void recordPromotion(String email, String belt, int stripe, LocalDate promotedAt) {
        PromotionHistoryEntity entity = new PromotionHistoryEntity();
        entity.setUserEmail(email);
        entity.setBeltCode(belt);
        entity.setStripeCount(stripe);
        entity.setPromotedAt(promotedAt);

        userMapper.insertPromotionHistory(entity);
    }
}
