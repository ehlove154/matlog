package com.yjb.meltube.Results;

public enum CommonResult implements Result {
    FAILURE,
    FAILURE_DUPLICATE,
    FAILURE_SESSION_EXPIRED,
    FAILURE_NO_AFFILIATION,
    FAILURE_DENIED,
    SUCCESS
}
