package com.flowerguys.localpiece.domain.course.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@NoArgsConstructor
public class CourseResponseDto {

    @JsonProperty("trip_title")
    private String tripTitle;
    
    private List<CourseOptionDto> courses;
}