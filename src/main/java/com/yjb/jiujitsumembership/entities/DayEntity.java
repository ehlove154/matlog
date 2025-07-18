package com.yjb.jiujitsumembership.entities;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "daysCode")
public class DayEntity {
    private String daysCode;
    private String displayText;
}
