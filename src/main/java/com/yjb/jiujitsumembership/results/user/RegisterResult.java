package com.yjb.jiujitsumembership.results.user;

import com.yjb.jiujitsumembership.results.Result;

public enum RegisterResult implements Result {
    FAILURE_DUPLICATE_EMAIL,
    FAILURE_DUPLICATE_CONTACT,
    FAILURE_PASSWORD_SAME
}
