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
public class RepeatInfoDto {

    // --- 공통 필드 ---
    @JsonProperty("contentid")
    private String contentid;

    @JsonProperty("contenttypeid")
    private String contenttypeid;

    // --- 일반 관광타입 (숙박, 여행코스 제외) ---
    @JsonProperty("fldgubun")
    private String fldgubun; // 일련번호

    @JsonProperty("infoname")
    private String infoname; // 제목 (e.g., "입장료")

    @JsonProperty("infotext")
    private String infotext; // 내용 (e.g., "무료")

    @JsonProperty("serialnum")
    private String serialnum; // 반복일련번호

    // --- 여행코스 (contentTypeId=25) ---
    @JsonProperty("subcontentid")
    private String subcontentid; // 하위 콘텐츠 ID

    @JsonProperty("subdetailalt")
    private String subdetailalt; // 코스 이미지 설명

    @JsonProperty("subdetailimg")
    private String subdetailimg; // 코스 이미지

    @JsonProperty("subdetailoverview")
    private String subdetailoverview; // 코스 개요

    @JsonProperty("subname")
    private String subname; // 코스명

    @JsonProperty("subnum")
    private String subnum; // 반복일련번호

    // --- 숙박 (contentTypeId=32) ---
    @JsonProperty("roomcode")
    private String roomcode; // 객실코드

    @JsonProperty("roomtitle")
    private String roomtitle; // 객실명칭

    @JsonProperty("roomsize1")
    private String roomsize1; // 객실크기(평)

    @JsonProperty("roomcount")
    private String roomcount; // 객실수

    @JsonProperty("roombasecount")
    private String roombasecount; // 기준인원

    @JsonProperty("roommaxcount")
    private String roommaxcount; // 최대인원

    @JsonProperty("roomoffseasonminfee1")
    private String roomoffseasonminfee1; // 비수기주중최소

    @JsonProperty("roomoffseasonminfee2")
    private String roomoffseasonminfee2; // 비수기주말최소

    @JsonProperty("roompeakseasonminfee1")
    private String roompeakseasonminfee1; // 성수기주중최소

    @JsonProperty("roompeakseasonminfee2")
    private String roompeakseasonminfee2; // 성수기주말최소

    @JsonProperty("roomintro")
    private String roomintro; // 객실소개

    @JsonProperty("roombathfacility")
    private String roombathfacility; // 목욕시설여부

    @JsonProperty("roombath")
    private String roombath; // 욕조여부

    @JsonProperty("roomhometheater")
    private String roomhometheater; // 홈시어터여부

    @JsonProperty("roomaircondition")
    private String roomaircondition; // 에어컨여부

    @JsonProperty("roomtv")
    private String roomtv; // TV 여부

    @JsonProperty("roompc")
    private String roompc; // PC 여부

    @JsonProperty("roomcable")
    private String roomcable; // 케이블설치여부

    @JsonProperty("roominternet")
    private String roominternet; // 인터넷여부

    @JsonProperty("roomrefrigerator")
    private String roomrefrigerator; // 냉장고여부

    @JsonProperty("roomtoiletries")
    private String roomtoiletries; // 세면도구여부

    @JsonProperty("roomsofa")
    private String roomsofa; // 소파여부

    @JsonProperty("roomcook")
    private String roomcook; // 취사용품여부

    @JsonProperty("roomtable")
    private String roomtable; // 테이블여부

    @JsonProperty("roomhairdryer")
    private String roomhairdryer; // 드라이기여부

    @JsonProperty("roomsize2")
    private String roomsize2; // 객실크기(평방미터)

    @JsonProperty("roomimg1")
    private String roomimg1; // 객실사진1

    @JsonProperty("roomimg1alt")
    private String roomimg1alt; // 객실사진1 설명
    
    @JsonProperty("cpyrhtDivCd1")
    private String cpyrhtDivCd1; // 저작권 유형 1

    @JsonProperty("roomimg2")
    private String roomimg2; // 객실사진2

    @JsonProperty("roomimg2alt")
    private String roomimg2alt; // 객실사진2 설명

    @JsonProperty("cpyrhtDivCd2")
    private String cpyrhtDivCd2; // 저작권 유형 2

    @JsonProperty("roomimg3")
    private String roomimg3; // 객실사진3

    @JsonProperty("roomimg3alt")
    private String roomimg3alt; // 객실사진3 설명

    @JsonProperty("cpyrhtDivCd3")
    private String cpyrhtDivCd3; // 저작권 유형 3

    @JsonProperty("roomimg4")
    private String roomimg4; // 객실사진4

    @JsonProperty("roomimg4alt")
    private String roomimg4alt; // 객실사진4 설명

    @JsonProperty("cpyrhtDivCd4")
    private String cpyrhtDivCd4; // 저작권 유형 4

    @JsonProperty("roomimg5")
    private String roomimg5; // 객실사진5

    @JsonProperty("roomimg5alt")
    private String roomimg5alt; // 객실사진5 설명

    @JsonProperty("cpyrhtDivCd5")
    private String cpyrhtDivCd5; // 저작권 유형 5
}