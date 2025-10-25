package com.flowerguys.localpiece.domain.course.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class CourseRequestDto {
    private List<Integer> cities;

    @JsonProperty("start_date")
    private String startDate;

    @JsonProperty("end_date") 
    private String endDate;

    private List<String> keywords;
    private String companions;
    private String pacing;

    @JsonProperty("must_visit_spots") 
    private List<Integer> mustVisitSpots;
}