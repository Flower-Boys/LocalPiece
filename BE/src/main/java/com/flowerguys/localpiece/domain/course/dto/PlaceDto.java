package com.flowerguys.localpiece.domain.course.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.flowerguys.localpiece.domain.savedcourse.entity.SavedPlace;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
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

    @JsonProperty("content_type_id")
    private String contentTypeId;

    public PlaceDto(SavedPlace savedPlace) {
        this.order = savedPlace.getOrderNum();
        this.contentId = savedPlace.getContentId();
        this.type = savedPlace.getType();
        this.name = savedPlace.getName();
        this.category = savedPlace.getCategory();
        this.address = savedPlace.getAddress();
        this.arrivalTime = savedPlace.getArrivalTime();
        this.departureTime = savedPlace.getDepartureTime();
        this.durationMinutes = savedPlace.getDurationMinutes();
    }
}