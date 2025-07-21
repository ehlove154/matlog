package com.yjb.jiujitsumembership.entities;

import lombok.*;

import java.time.LocalTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "classId")
public class ClassEntity {
    private int classId;
    private String className;
    private String userEmail;
    private String coach;
    private LocalTime startTime;
    private LocalTime endTime;
    private String day;
    private int gymId;
    private boolean isDelete;
}
