package com.flowerguys.localpiece.domain.course.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
public class DailyCourseDto {
    private int day;
    private String date;
    private List<PlaceDto> route;
}