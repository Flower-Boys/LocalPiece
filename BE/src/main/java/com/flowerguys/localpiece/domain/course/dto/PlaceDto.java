package com.flowerguys.localpiece.domain.course.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PlaceDto {
    private int order;

    @JsonProperty("content_id")
    private int contentId;

    private String type;
    private String name;
    private String category;
    private String address;

    @JsonProperty("arrival_time")
    private String arrivalTime;

    @JsonProperty("departure_time")
    private String departureTime;

    @JsonProperty("duration_minutes")
    private int durationMinutes;
}