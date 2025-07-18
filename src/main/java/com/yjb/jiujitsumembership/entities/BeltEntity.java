package com.yjb.jiujitsumembership.entities;

import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "beltCode")
public class BeltEntity {
    private String beltCode;
    private String displayText;
}
