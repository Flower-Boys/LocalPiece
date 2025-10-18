package com.flowerguys.localpiece.domain.course.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.flowerguys.localpiece.domain.piece.entity.PiecePlace;

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

    public PlaceDto(PiecePlace place) {
        this.order = place.getOrderNum();
        this.contentId = place.getContentId();
        this.type = place.getType();
        this.name = place.getName();
        this.category = place.getCategory();
        this.address = place.getAddress();
        this.arrivalTime = place.getArrivalTime();
        this.departureTime = place.getDepartureTime();
        this.durationMinutes = place.getDurationMinutes();
    }
}