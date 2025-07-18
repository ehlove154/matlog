package com.yjb.meltube.Results;

public interface Result {
    String name();

    default String nameToLower() {
        return this.name().toLowerCase();
    }
}
