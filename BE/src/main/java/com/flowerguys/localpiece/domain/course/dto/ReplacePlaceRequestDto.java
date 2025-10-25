package com.flowerguys.localpiece.domain.course.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReplacePlaceRequestDto {
    @JsonProperty("course_option") 
    private CourseOptionDto courseOption;

    @JsonProperty("day_number") 
    private int dayNumber;

    @JsonProperty("place_order_to_replace") 
    private int placeOrderToReplace;
}