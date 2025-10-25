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
public class IntroductionInfoDto {

    // --- 공통 필드 ---
    @JsonProperty("contentid")
    private String contentid;

    @JsonProperty("contenttypeid")
    private String contenttypeid;

    // --- 관광지 (contentTypeId=12) ---
    @JsonProperty("accomcount")
    private String accomcount; // 수용인원

    @JsonProperty("chkbabycarriage")
    private String chkbabycarriage; // 유모차대여 정보

    @JsonProperty("chkcreditcard")
    private String chkcreditcard; // 신용카드가능 정보

    @JsonProperty("chkpet")
    private String chkpet; // 애완동물동반가능 정보

    @JsonProperty("expagerange")
    private String expagerange; // 체험가능 연령

    @JsonProperty("expguide")
    private String expguide; // 체험안내

    @JsonProperty("heritage1")
    private String heritage1; // 세계문화유산유무

    @JsonProperty("heritage2")
    private String heritage2; // 세계자연유산유무

    @JsonProperty("heritage3")
    private String heritage3; // 세계기록유산유무

    @JsonProperty("infocenter")
    private String infocenter; // 문의 및 안내

    @JsonProperty("opendate")
    private String opendate; // 개장일

    @JsonProperty("parking")
    private String parking; // 주차시설

    @JsonProperty("restdate")
    private String restdate; // 쉬는날

    @JsonProperty("useseason")
    private String useseason; // 이용시기

    @JsonProperty("usetime")
    private String usetime; // 이용시간

    // --- 문화시설 (contentTypeId=14) ---
    @JsonProperty("accomcountculture")
    private String accomcountculture; // 수용인원

    @JsonProperty("chkbabycarriageculture")
    private String chkbabycarriageculture; // 유모차대여 정보

    @JsonProperty("chkcreditcardculture")
    private String chkcreditcardculture; // 신용카드가능 정보

    @JsonProperty("chkpetculture")
    private String chkpetculture; // 애완동물동반가능 정보

    @JsonProperty("discountinfo")
    private String discountinfo; // 할인정보

    @JsonProperty("infocenterculture")
    private String infocenterculture; // 문의 및 안내

    @JsonProperty("parkingculture")
    private String parkingculture; // 주차시설

    @JsonProperty("parkingfee")
    private String parkingfee; // 주차요금

    @JsonProperty("restdateculture")
    private String restdateculture; // 쉬는날

    @JsonProperty("usefee")
    private String usefee; // 이용요금

    @JsonProperty("usetimeculture")
    private String usetimeculture; // 이용시간

    @JsonProperty("scale")
    private String scale; // 규모

    @JsonProperty("spendtime")
    private String spendtime; // 관람소요시간

        // --- 행사/공연/축제 (contentTypeId=15) ---
    @JsonProperty("agelimit")
    private String agelimit; // 관람가능연령

    @JsonProperty("bookingplace")
    private String bookingplace; // 예매처

    @JsonProperty("discountinfofestival")
    private String discountinfofestival; // 할인정보

    @JsonProperty("eventenddate")
    private String eventenddate; // 행사종료일

    @JsonProperty("eventhomepage")
    private String eventhomepage; // 행사홈페이지

    @JsonProperty("eventplace")
    private String eventplace; // 행사장소

    @JsonProperty("eventstartdate")
    private String eventstartdate; // 행사시작일

    @JsonProperty("festivalgrade")
    private String festivalgrade; // 축제등급

    @JsonProperty("placeinfo")
    private String placeinfo; // 행사장 위치안내

    @JsonProperty("playtime")
    private String playtime; // 공연시간

    @JsonProperty("program")
    private String program; // 행사프로그램

    @JsonProperty("spendtimefestival")
    private String spendtimefestival; // 관람소요시간

    @JsonProperty("sponsor1")
    private String sponsor1; // 주최자정보

    @JsonProperty("sponsor1tel")
    private String sponsor1tel; // 주최자연락처

    @JsonProperty("sponsor2")
    private String sponsor2; // 주관사정보

    @JsonProperty("sponsor2tel")
    private String sponsor2tel; // 주관사연락처

    @JsonProperty("subevent")
    private String subevent; // 부대행사

    @JsonProperty("usetimefestival")
    private String usetimefestival; // 이용요금

    // --- 여행코스 (contentTypeId=25) ---
    @JsonProperty("distance")
    private String distance; // 코스총거리

    @JsonProperty("infocentertourcourse")
    private String infocentertourcourse; // 문의 및 안내

    @JsonProperty("schedule")
    private String schedule; // 코스일정

    @JsonProperty("taketime")
    private String taketime; // 코스총소요시간

    @JsonProperty("theme")
    private String theme; // 코스테마

    // --- 레포츠 (contentTypeId=28) ---
    @JsonProperty("accomcountleports")
    private String accomcountleports; // 수용인원

    @JsonProperty("chkbabycarriageleports")
    private String chkbabycarriageleports; // 유모차대여 정보

    @JsonProperty("chkcreditcardleports")
    private String chkcreditcardleports; // 신용카드가능 정보

    @JsonProperty("chkpetleports")
    private String chkpetleports; // 애완동물동반가능 정보

    @JsonProperty("expagerangeleports")
    private String expagerangeleports; // 체험가능연령

    @JsonProperty("infocenterleports")
    private String infocenterleports; // 문의 및 안내

    @JsonProperty("openperiod")
    private String openperiod; // 개장기간

    @JsonProperty("parkingfeeleports")
    private String parkingfeeleports; // 주차요금

    @JsonProperty("parkingleports")
    private String parkingleports; // 주차시설

    @JsonProperty("reservation")
    private String reservation; // 예약안내

    @JsonProperty("restdateleports")
    private String restdateleports; // 쉬는날

    @JsonProperty("scaleleports")
    private String scaleleports; // 규모

    @JsonProperty("usefeeleports")
    private String usefeeleports; // 입장료

    @JsonProperty("usetimeleports")
    private String usetimeleports; // 이용시간

    // --- 숙박 (contentTypeId=32) ---
    @JsonProperty("accomcountlodging")
    private String accomcountlodging; // 수용가능인원

    @JsonProperty("checkintime")
    private String checkintime; // 입실시간

    @JsonProperty("checkouttime")
    private String checkouttime; // 퇴실시간

    @JsonProperty("chkcooking")
    private String chkcooking; // 객실내취사 여부

    @JsonProperty("foodplace")
    private String foodplace; // 식음료장

    @JsonProperty("infocenterlodging")
    private String infocenterlodging; // 문의 및 안내

    @JsonProperty("parkinglodging")
    private String parkinglodging; // 주차시설

    @JsonProperty("pickup")
    private String pickup; // 픽업서비스

    @JsonProperty("roomcount")
    private String roomcount; // 객실수

    @JsonProperty("reservationlodging")
    private String reservationlodging; // 예약안내

    @JsonProperty("reservationurl")
    private String reservationurl; // 예약안내 홈페이지

    @JsonProperty("roomtype")
    private String roomtype; // 객실유형

    @JsonProperty("scalelodging")
    private String scalelodging; // 규모

    @JsonProperty("subfacility")
    private String subfacility; // 부대시설 (기타)

    @JsonProperty("barbecue")
    private String barbecue; // 바비큐장 여부

    @JsonProperty("beauty")
    private String beauty; // 뷰티시설 정보

    @JsonProperty("beverage")
    private String beverage; // 식음료장 여부

    @JsonProperty("bicycle")
    private String bicycle; // 자전거대여 여부

    @JsonProperty("campfire")
    private String campfire; // 캠프파이어 여부

    @JsonProperty("fitness")
    private String fitness; // 휘트니스센터 여부

    @JsonProperty("karaoke")
    private String karaoke; // 노래방 여부

    @JsonProperty("publicbath")
    private String publicbath; // 공용샤워실 여부

    @JsonProperty("publicpc")
    private String publicpc; // 공용 PC실 여부

    @JsonProperty("sauna")
    private String sauna; // 사우나실 여부

    @JsonProperty("seminar")
    private String seminar; // 세미나실 여부

    @JsonProperty("sports")
    private String sports; // 스포츠시설 여부

    @JsonProperty("refundregulation")
    private String refundregulation; // 환불규정

    // --- 쇼핑 (contentTypeId=38) ---
    @JsonProperty("chkbabycarriageshopping")
    private String chkbabycarriageshopping; // 유모차대여 정보

    @JsonProperty("chkcreditcardshopping")
    private String chkcreditcardshopping; // 신용카드가능 정보

    @JsonProperty("chkpetshopping")
    private String chkpetshopping; // 애완동물동반가능 정보

    @JsonProperty("culturecenter")
    private String culturecenter; // 문화센터 바로가기

    @JsonProperty("fairday")
    private String fairday; // 장서는 날

    @JsonProperty("infocentershopping")
    private String infocentershopping; // 문의 및 안내

    @JsonProperty("opendateshopping")
    private String opendateshopping; // 개장일

    @JsonProperty("opentime")
    private String opentime; // 영업시간

    @JsonProperty("parkingshopping")
    private String parkingshopping; // 주차시설

    @JsonProperty("restdateshopping")
    private String restdateshopping; // 쉬는날

    @JsonProperty("restroom")
    private String restroom; // 화장실 설명

    @JsonProperty("saleitem")
    private String saleitem; // 판매품목

    @JsonProperty("saleitemcost")
    private String saleitemcost; // 판매품목별 가격

    @JsonProperty("scaleshopping")
    private String scaleshopping; // 규모

    @JsonProperty("shopguide")
    private String shopguide; // 매장안내

    // --- 음식점 (contentTypeId=39) ---
    @JsonProperty("chkcreditcardfood")
    private String chkcreditcardfood; // 신용카드가능 정보

    @JsonProperty("discountinfofood")
    private String discountinfofood; // 할인정보

    @JsonProperty("firstmenu")
    private String firstmenu; // 대표메뉴

    @JsonProperty("infocenterfood")
    private String infocenterfood; // 문의 및 안내

    @JsonProperty("kidsfacility")
    private String kidsfacility; // 어린이놀이방 여부

    @JsonProperty("opendatefood")
    private String opendatefood; // 개업일

    @JsonProperty("opentimefood")
    private String opentimefood; // 영업시간

    @JsonProperty("packing")
    private String packing; // 포장가능

    @JsonProperty("parkingfood")
    private String parkingfood; // 주차시설

    @JsonProperty("reservationfood")
    private String reservationfood; // 예약안내

    @JsonProperty("restdatefood")
    private String restdatefood; // 쉬는날

    @JsonProperty("scalefood")
    private String scalefood; // 규모

    @JsonProperty("seat")
    private String seat; // 좌석수

    @JsonProperty("smoking")
    private String smoking; // 금연/흡연여부

    @JsonProperty("treatmenu")
    private String treatmenu; // 취급메뉴

    @JsonProperty("lcnsno")
    private String lcnsno; // 인허가번호
}