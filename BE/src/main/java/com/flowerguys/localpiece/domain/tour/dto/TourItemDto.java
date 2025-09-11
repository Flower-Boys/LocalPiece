package com.flowerguys.localpiece.domain.tour.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

// 프론트엔드에 최종적으로 전달될 깔끔한 관광정보 DTO
@Getter
@ToString
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // JSON에 있는데 DTO에 없는 필드는 무시
public class TourItemDto {

    @JsonProperty("contentid")
    private String id;

    @JsonProperty("title")
    private String title;

    @JsonProperty("addr1")
    private String address;

    @JsonProperty("firstimage")
    private String imageUrl;

    @JsonProperty("mapx")
    private String mapX;

    @JsonProperty("mapy")
    private String mapY;
}