package com.yjb.meltube.Results.user;

import com.yjb.meltube.Results.Result;

public enum RegisterResult implements Result {
    FAILURE_DUPLICATE_EMAIL,
    FAILURE_DUPLICATE_NICKNAME
}
