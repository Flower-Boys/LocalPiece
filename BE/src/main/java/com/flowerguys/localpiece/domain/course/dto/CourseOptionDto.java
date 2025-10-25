package com.flowerguys.localpiece.domain.course.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@NoArgsConstructor
public class CourseOptionDto {

    @JsonProperty("theme_title")
    private String themeTitle;
    
    private List<DailyCourseDto> days;
}