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
public class PetTourInfoDto {

    @JsonProperty("contentid")
    private String contentid; // 콘텐츠 ID

    @JsonProperty("acmpyPsblCpam")
    private String acmpyPsblCpam; // 동반가능동물

    @JsonProperty("relaRntlPrdlst")
    private String relaRntlPrdlst; // 관련 렌탈 품목

    @JsonProperty("acmpyNeedMtr")
    private String acmpyNeedMtr; // 동반시 필요사항

    @JsonProperty("relaFrnshPrdlst")
    private String relaFrnshPrdlst; // 관련 비치 품목

    @JsonProperty("etcAcmpyInfo")
    private String etcAcmpyInfo; // 기타 동반 정보

    @JsonProperty("relaPurcPrdlst")
    private String relaPurcPrdlst; // 관련 구매 품목

    @JsonProperty("relaAcdntRiskMtr")
    private String relaAcdntRiskMtr; // 관련 사고 대비사항

    @JsonProperty("acmpyTypeCd")
    private String acmpyTypeCd; // 동반유형코드 (동반구분)

    @JsonProperty("relaPosesFclty")
    private String relaPosesFclty; // 관련 구비 시설

    @JsonProperty("petTursmInfo")
    private String petTursmInfo; // 반려동물 관광정보
}