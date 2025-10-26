package com.flowerguys.localpiece.domain.tour.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@ToString
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ImageInfoDto {

    @JsonProperty("contentid")
    private String contentid;

    @JsonProperty("imgname")
    private String imgname; // 이미지명

    @JsonProperty("originimgurl")
    private String originimgurl; // 원본 이미지 URL

    @JsonProperty("serialnum")
    private String serialnum; // 이미지 일련번호

    @JsonProperty("cpyrhtDivCd")
    private String cpyrhtDivCd; // 저작권 유형

    @JsonProperty("smallimageurl")
    private String smallimageurl; // 썸네일 이미지 URL
}