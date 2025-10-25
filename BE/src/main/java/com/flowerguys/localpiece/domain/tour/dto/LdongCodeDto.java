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
public class LdongCodeDto {

    // lDongListYn=N 일 때 사용되는 필드
    @JsonProperty("code")
    private String code;

    @JsonProperty("name")
    private String name;

    // lDongListYn=Y 일 때 사용되는 필드
    @JsonProperty("lDongRegnCd")
    private String lDongRegnCd;

    @JsonProperty("lDongRegnNm")
    private String lDongRegnNm;

    @JsonProperty("lDongSignguCd")
    private String lDongSignguCd;

    @JsonProperty("lDongSignguNm")
    private String lDongSignguNm;
    
    @JsonProperty("rnum")
    private int rnum;
}