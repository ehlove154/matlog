package com.yjb.jiujitsumembership.regexes;

import com.yjb.jiujitsumembership.entities.UserEntity;
import lombok.experimental.UtilityClass;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@UtilityClass
public class UserRegex {

    public static String buildEnumPattern(Class<? extends Enum<?>> e) {
        return Arrays.stream(e.getEnumConstants())
                .map(Enum::name)
                .collect(Collectors.joining("|", "^(", ")$"));
    }


    public static final Pattern gender = Pattern.compile(buildEnumPattern(UserEntity.Gender.class));

    public static final Pattern userRole = Pattern.compile(buildEnumPattern(UserEntity.UserRole.class));

    public static final Pattern email = Pattern.compile("^(?=.{8,100}$)([\\da-z\\-_.]{4,})@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2,3})?$");

    public static final Pattern password = Pattern.compile("^([\\da-zA-Z`~!@#$%^&*()\\-_=+\\[\\{\\]\\}\\\\|;:'\",<.>\\/?]{8,127})$");

    public static final Pattern name = Pattern.compile("^[\\da-zA-Z가-힣]{2,5}$");

    public static final Pattern contact = Pattern.compile("^\\d{10,11}$");

    public static final Pattern contactCode = Pattern.compile("^\\d{6}$");

    public static final Pattern gymName = Pattern.compile("^[\\da-zA-Z가-힣\\s]{2,30}$");
}
