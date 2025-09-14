package com.flowerguys.localpiece.domain.tour.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@ToString(callSuper = true)
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EventItemDto extends TourItemDto {

    @JsonProperty("eventstartdate")
    private String eventstartdate; // 행사 시작일

    @JsonProperty("eventenddate")
    private String eventenddate;   // 행사 종료일
}