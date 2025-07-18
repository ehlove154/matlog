package com.yjb.jiujitsumembership.services;

import com.yjb.jiujitsumembership.entities.GymEntity;
import com.yjb.jiujitsumembership.entities.MembershipEntity;
import com.yjb.jiujitsumembership.entities.PromotionHistoryEntity;
import com.yjb.jiujitsumembership.entities.UserEntity;
import com.yjb.jiujitsumembership.mappers.GymMapper;
import com.yjb.jiujitsumembership.results.CommonResult;
import com.yjb.jiujitsumembership.results.Result;
import com.yjb.jiujitsumembership.mappers.UserMapper;
import com.yjb.jiujitsumembership.regexes.UserRegex;
import com.yjb.jiujitsumembership.results.ResultTuple;
import com.yjb.jiujitsumembership.results.user.LoginResult;
import com.yjb.jiujitsumembership.results.user.RegisterResult;
import com.yjb.jiujitsumembership.utils.CryptoUtils;
import com.yjb.jiujitsumembership.vos.UserListVo;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

@Service
public class UserService {
    private final UserMapper userMapper;
    private final GymMapper gymMapper;
    private final PromotionHistoryService promotionHistoryService;

    public UserService(UserMapper userMapper, GymMapper gymMapper, PromotionHistoryService promotionHistoryService) {
        this.userMapper = userMapper;
        this.gymMapper = gymMapper;
        this.promotionHistoryService = promotionHistoryService;
    }

    public static boolean ifFutureDate(LocalDate localDate) {
        return localDate.isAfter(LocalDate.now());
    }

    public Result isEmailAvailable(String email) { // 이메일 중복 체크
        if (!UserRegex.email.matcher(email).matches()) {
            System.out.println("email failure 1");
            return CommonResult.FAILURE;
        }

        return this.userMapper.selectCountByEmail(email) > 0 ? CommonResult.FAILURE : CommonResult.SUCCESS;
    }

    public Result isContactAvailable(String contact) { // 전화번호 중복 체크
        if (!UserRegex.contact.matcher(contact).matches()) {
            System.out.println("contact failure 1");
            return CommonResult.FAILURE;
        }
        return this.userMapper.selectCountByContact(contact) > 0 ? CommonResult.FAILURE : CommonResult.SUCCESS;
    }

    public Result register(UserEntity user) { // 회원가입
        // ✅ 1. 필수값 유효성 검사
        if (user == null ||
                user.getBirth() == null ||
                user.getGender() == null || !UserRegex.gender.matcher(user.getGender()).matches() ||
                user.getContact() == null || user.getAddressPostal() == null ||
                user.getAddressPrimary() == null || user.getAddressSecondary() == null ||
                user.getUserRole() == null || user.getBelt() == null) {
            System.out.println("register failure 1");

            return CommonResult.FAILURE;
        }

        // ✅ 2. 비밀번호 해싱
        user.setPassword(CryptoUtils.hashSha512(user.getPassword()));

        // ✅ 3. 공통 세팅
        user.setLastSignedAt(LocalDateTime.now());
        user.setCreatedAt(LocalDateTime.now());
        user.setModifiedAt(LocalDateTime.now());
        user.setDelete(false);
        user.setSuspended(false);
        user.setMembership("NONE");
        user.setLastPromotionAt(user.getLastPromotionAt());

        // ✅ 4. 역할별 분기
        if ("MASTER".equals(user.getUserRole())) {
            // Gym 등록
            GymEntity gym = new GymEntity();
            gym.setUserEmail(user.getEmail());
            gym.setGymName(user.getGymName());
            gym.setAddressPostal(user.getAddressPostal());
            gym.setAddressPrimary(user.getAddressPrimary());
            gym.setAddressSecondary(user.getAddressSecondary());
            gym.setCreatedAt(LocalDateTime.now());
            gym.setModifiedAt(LocalDateTime.now());
            gym.setActive(true);

            this.gymMapper.insert(gym);
            user.setGymId(gym.getGymId()); // 자동 증가된 gym_id 설정
        } else if ("MEMBER".equals(user.getUserRole())) {
            // 관원은 gymId가 필수
            if (user.getGymId() == null) {
                System.out.println("register failure 4 - gymId null for MEMBER");
                return CommonResult.FAILURE;
            }
        } else {
            System.out.println("register failure 5 - unknown role");
            return CommonResult.FAILURE;
        }

        int affected = this.userMapper.insert(user);
        if (affected == 0) {
            return CommonResult.FAILURE;
        }

        if (user.getBelt() != null && user.getStripe() != null && user.getLastPromotionAt() != null) {
            PromotionHistoryEntity promotion = PromotionHistoryEntity.builder()
                    .userEmail(user.getEmail())
                    .beltCode(user.getBelt())
                    .stripeCount(user.getStripe())
                    .promotedAt(user.getLastPromotionAt())
                    .build();

            try {
                this.userMapper.insertPromotionHistory(promotion);
            } catch (Exception e) {
                System.out.println("승급 이력 저장 실패");
                return CommonResult.FAILURE;
            }
        } else if (user.getStripe() != null || user.getLastPromotionAt() != null) {
            System.out.println("⚠️ belt/stripe/promotedAt 중 일부만 입력됨 → 승급이력 미저장");
        }

        // ✅ 5. 최종 저장
        return CommonResult.SUCCESS;
    }

    public ResultTuple<UserEntity> login(String email, String password) { // 로그인
        if (email == null ||
                password == null ||
                !UserRegex.email.matcher(email).matches() ||
                !UserRegex.password.matcher(password).matches()) {
            System.out.println("login failure 1");
            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
        }

        UserEntity dbUser = this.userMapper.selectByEmail(email);
        if (dbUser == null || dbUser.isDelete()) {
            System.out.println("login failure 2");
            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
        }
        String hashedPassword = CryptoUtils.hashSha512(password);
        if (!dbUser.getPassword().equals(hashedPassword)) {
            System.out.println("login failure 3");
            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
        }
        if (dbUser.isSuspended()) {
            System.out.println("login failure 4");
            return ResultTuple.<UserEntity>builder().result(LoginResult.FAILURE_SUSPENDED).build();
        }

        System.out.println("login success");
        return ResultTuple.<UserEntity>builder().payload(dbUser).result(CommonResult.SUCCESS).build();
    }

    public ResultTuple<UserEntity> modify(UserEntity signedUser, String password, String newPassword, String contact, String newContact, String addressPostal, String addressPrimary, String addressSecondary) {  //회원정보 수정
        if (signedUser == null || signedUser.isDelete() || signedUser.isSuspended()) {
            System.out.println("modify failure 1");
            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
        }

        if (!UserRegex.email.matcher(signedUser.getEmail()).matches()) {
            System.out.println("modify failure 2");
            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
        }

        String hashedPassword = CryptoUtils.hashSha512(password);
        if (!signedUser.getPassword().equals(hashedPassword)) {
            System.out.println("modify failure 3");
            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
        }

        String hashedNewPassword = null;
        if (newPassword != null && !newPassword.isBlank()) {
            if (!UserRegex.password.matcher(newPassword).matches()) {
                System.out.println("modify failure 4");
                return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
            }
            hashedNewPassword = CryptoUtils.hashSha512(newPassword);
            if (signedUser.getPassword().equals(hashedNewPassword)) {
                System.out.println("modify failure 5");
                return ResultTuple.<UserEntity>builder().result(RegisterResult.FAILURE_PASSWORD_SAME).build();
            }
        }

        if (newContact != null && !newContact.isBlank()) {
            if (!UserRegex.contact.matcher(newContact).matches()) {
                System.out.println("modify failure 6");
                return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
            }

            if (!signedUser.getContact().equals(newContact)) {
                if (this.userMapper.selectCountByContact(newContact) > 0) {
                    System.out.println("modify failure 7");
                    return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
                }
            }
        }

        boolean anyAddressProvided = Stream.of(addressPostal, addressPrimary, addressSecondary)
                .anyMatch(value -> value != null && !value.trim().isEmpty());

        if (anyAddressProvided) {
            if (Stream.of(addressPostal, addressPrimary, addressSecondary).anyMatch(value -> value.trim().isEmpty())) {
                System.out.println("modify failure 8");
                return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
            }
            addressPostal = addressPostal.trim();
            addressPrimary = addressPrimary.trim();
            addressSecondary = addressSecondary.trim();
        } else {
            addressPostal = null;
            addressPrimary = null;
            addressSecondary = null;
        }

        UserEntity user = new UserEntity();
        user.setEmail(signedUser.getEmail());
        user.setPassword(hashedNewPassword == null ? signedUser.getPassword() : hashedNewPassword);
        user.setContact(newContact != null && !newContact.isBlank() ? newContact : signedUser.getContact());
        user.setAddressPostal(addressPostal);
        user.setAddressPrimary(addressPrimary);
        user.setAddressSecondary(addressSecondary);
        user.setLastSignedAt(LocalDateTime.now());
        user.setModifiedAt(LocalDateTime.now());
        user.setLastSignedUa(signedUser.getLastSignedUa());
        user.setLastSignedAt(LocalDateTime.now());
        user.setDelete(false);
        user.setSuspended(false);

        if (this.userMapper.update(user) > 0) {
            signedUser.setPassword(user.getPassword());
            signedUser.setContact(user.getContact());
            signedUser.setAddressPostal(user.getAddressPostal());
            signedUser.setAddressPrimary(user.getAddressPrimary());
            signedUser.setAddressSecondary(user.getAddressSecondary());
            return ResultTuple.<UserEntity>builder().result(CommonResult.SUCCESS).build();
        } else {
            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
        }
    }

    public ResultTuple<GymEntity> gymInfo(UserEntity signedUser, String gymName, String addressPostal, String addressPrimary, String addressSecondary, Boolean isActive) { // 체육관 정보 입력
        // 사용자 유효성 검사
        if (signedUser == null || signedUser.isSuspended() || signedUser.isDelete() || Objects.equals(signedUser.getUserRole(), "MEMBER")) {
            System.out.println("gymInfo failure 1");
            return ResultTuple.<GymEntity>builder().result(CommonResult.FAILURE).build();
        }

        // 기존 체육관 정보 조회
        GymEntity gym = gymMapper.selectByEmail(signedUser.getEmail()); // 또는 getId() 등 사용자 기준
        if (gym == null) {
            System.out.println("gymInfo failure 2 - gym not found");
            return ResultTuple.<GymEntity>builder().result(CommonResult.FAILURE).build();
        }

        // 상호명 유효성 검사
        if (gymName == null || !UserRegex.gymName.matcher(gymName).matches()) {
            System.out.println("gymInfo failure 3 - invalid name");
            return ResultTuple.<GymEntity>builder().result(CommonResult.FAILURE).build();
        }

        // 주소 유효성 검사
        boolean anyAddressProvided = Stream.of(addressPostal, addressPrimary, addressSecondary)
                .anyMatch(value -> value != null && !value.trim().isEmpty());

        if (anyAddressProvided) {
            if (Stream.of(addressPostal, addressPrimary, addressSecondary).anyMatch(value -> value == null || value.trim().isEmpty())) {
                System.out.println("gymInfo failure 4 - address incomplete");
                return ResultTuple.<GymEntity>builder().result(CommonResult.FAILURE).build();
            }

            addressPostal = addressPostal.trim();
            addressPrimary = addressPrimary.trim();
            addressSecondary = addressSecondary.trim();
        } else {
            addressPostal = null;
            addressPrimary = null;
            addressSecondary = null;
        }

        // 값 반영
        gym.setGymName(gymName);
        gym.setAddressPostal(addressPostal);
        gym.setAddressPrimary(addressPrimary);
        gym.setAddressSecondary(addressSecondary);
        gym.setActive(isActive != null && isActive);

        gymMapper.update(gym); // 실제 DB 반영 메서드 필요 (예: updateByEmail 등)

        return ResultTuple.<GymEntity>builder()
                .result(CommonResult.SUCCESS)
                .payload(gym)
                .build();
    }


//    public ResultTuple<UserEntity> userInfoModify(String targetEmail, String belt, Integer stripe, LocalDate promotion) {
//        UserEntity targetUser = this.userMapper.selectByEmail(targetEmail);
//        if (targetUser == null || targetUser.isDelete() || targetUser.isSuspended()) {
//            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
//        }
//
//        if (belt == null || belt.isBlank()) {
//            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
//        }
//
//        if (promotion != null && promotion.isAfter(LocalDate.now())) {
//            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
//        }
//
//        PromotionHistoryEntity history = new PromotionHistoryEntity();
//        history.setUserEmail(targetEmail);
//        history.setBeltCode(belt.trim());
//        history.setStripeCount(stripe != null ? stripe : 0);
//        history.setPromotedAt(promotion != null ? promotion : LocalDate.now());
//
//        this.userMapper.insertPromotionHistory(history);
//        this.userMapper.updateUserBeltAndPromotion(targetEmail, belt.trim(), history.getPromotedAt());
//
//        return ResultTuple.<UserEntity>builder().result(CommonResult.SUCCESS).build();
//    }



//    public ResultTuple<UserEntity> userInfoModify(String email, String belt, int stripe, LocalDate promotionDate) {
//        UserEntity user = this.userMapper.selectByEmail(email);
//        if (user == null) {
//            System.out.println("해당 이메일의 유저가 존재하지 않습니다: " + email);
//            return ResultTuple.<UserEntity>builder().result(CommonResult.FAILURE).build();
//        }
//
//        System.out.printf("업데이트 전 -> 벨트: %s, 스트라이프: %d, 승급일: %s\n",
//                user.getBelt(), user.getStripe(), user.getLastPromotionAt());
//
//        user.setBelt(belt);
//        user.setStripe(stripe);
//        user.setLastPromotionAt(promotionDate);
//
//        userMapper.update(user);
//
//        System.out.println("업데이트 완료");
//
//        return ResultTuple.<UserEntity>builder().result(CommonResult.SUCCESS).build();
//    }

    public ResultTuple<UserEntity> userInfoModify(String targetEmail, String belt, int stripe, LocalDate promotion) {
        UserEntity targetUser = userMapper.selectByEmail(targetEmail);
        if (targetUser == null) {
            return ResultTuple.<UserEntity>builder()
                    .result(CommonResult.FAILURE)
                    .build();
        }

        targetUser.setBelt(belt);
        targetUser.setLastPromotionAt(promotion);
        targetUser.setModifiedAt(LocalDateTime.now());
        userMapper.update(targetUser);

        promotionHistoryService.recordPromotion(targetEmail, belt, stripe, promotion);

        return ResultTuple.<UserEntity>builder()
                .result(CommonResult.SUCCESS)
                .payload(targetUser)
                .build();
    }




    public List<UserEntity> getAllUsersForAdmin() {
        return null;
    }

    public void registerMembership(UserListVo userListVo) {
        MembershipEntity membership = this.userMapper.selectByCode(userListVo.getMembership());

        LocalDate joinedDate = LocalDate.now();
        userListVo.setJoinedDate(joinedDate);

        if (membership.getDurationMonth() != null) {
            LocalDate expireDate = LocalDate.now().plusMonths(membership.getDurationMonth());
            userListVo.setExpireDate(expireDate);
        }
        return;
    }
}