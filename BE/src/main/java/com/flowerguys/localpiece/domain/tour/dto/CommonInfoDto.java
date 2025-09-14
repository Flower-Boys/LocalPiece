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
public class CommonInfoDto {

    @JsonProperty("contentid")
    private String contentid;

    @JsonProperty("contenttypeid")
    private String contenttypeid;

    @JsonProperty("title")
    private String title;

    @JsonProperty("createdtime")
    private String createdtime;

    @JsonProperty("modifiedtime")
    private String modifiedtime;

    @JsonProperty("tel")
    private String tel;

    @JsonProperty("telname")
    private String telname;

    @JsonProperty("homepage")
    private String homepage;

    @JsonProperty("firstimage")
    private String firstimage;

    @JsonProperty("firstimage2")
    private String firstimage2;

    @JsonProperty("cpyrhtDivCd")
    private String cpyrhtDivCd;

    @JsonProperty("areacode")
    private String areacode;

    @JsonProperty("sigungucode")
    private String sigungucode;
    
    @JsonProperty("lDongRegnCd")
    private String lDongRegnCd;

    @JsonProperty("lDongSignguCd")
    private String lDongSignguCd;

    @JsonProperty("lclsSystm1")
    private String lclsSystm1;
    
    @JsonProperty("lclsSystm2")
    private String lclsSystm2;

    @JsonProperty("lclsSystm3")
    private String lclsSystm3;
    
    @JsonProperty("addr1")
    private String addr1;

    @JsonProperty("addr2")
    private String addr2;

    @JsonProperty("zipcode")
    private String zipcode;

    @JsonProperty("mapx")
    private String mapx;

    @JsonProperty("mapy")
    private String mapy;

    @JsonProperty("mlevel")
    private String mlevel;

    @JsonProperty("overview")
    private String overview;
}