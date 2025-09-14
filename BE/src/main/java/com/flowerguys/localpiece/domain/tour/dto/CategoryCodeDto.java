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
public class CategoryCodeDto {

    // lclsSystmListYn=N 일 때 사용되는 필드
    @JsonProperty("code")
    private String code;

    @JsonProperty("name")
    private String name;

    // lclsSystmListYn=Y 일 때 사용되는 필드
    @JsonProperty("lclsSystm1Cd")
    private String lclsSystm1Cd;

    @JsonProperty("lclsSystm1Nm")
    private String lclsSystm1Nm;
    
    @JsonProperty("lclsSystm2Cd")
    private String lclsSystm2Cd;

    @JsonProperty("lclsSystm2Nm")
    private String lclsSystm2Nm;

    @JsonProperty("lclsSystm3Cd")
    private String lclsSystm3Cd;

    @JsonProperty("lclsSystm3Nm")
    private String lclsSystm3Nm;

    @JsonProperty("rnum")
    private int rnum;
}