package com.flowerguys.localpiece.domain.tour.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@ToString(callSuper = true) // 부모 클래스의 toString() 결과도 포함
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TourItemWithDistDto extends TourItemDto {

    @JsonProperty("dist")
    private String dist; // 중심 좌표로부터의 거리 (단위: m)
}