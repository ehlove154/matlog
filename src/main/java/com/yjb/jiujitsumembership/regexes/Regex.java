package com.yjb.jiujitsumembership.regexes;

public class Regex {
    public final String pattern;

    public Regex(String pattern) {
        this.pattern = pattern;
    }

    public boolean matches(String input) {
        return this.matches(input, false);
    }

    public boolean matches(String input, boolean allowEmptyOrNull) {
        if (input == null || input.isEmpty()) {
            return allowEmptyOrNull;
        }
        return input.matches(this.pattern);
    }
}
