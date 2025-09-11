package com.flowerguys.localpiece.domain.tour.controller;

import com.flowerguys.localpiece.domain.tour.service.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tour")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    /**
     * 경상북도 지역기반 관광정보 조회 API (신규 법정동 코드, 관광타입 필터링 지원)
     * @param sigunguCode 법정동 시군구코드 (선택). 
     * @param contentTypeId 관광타입 ID (선택). 12:관광지, 32:숙박, 39:음식점 등
     * @param pageNo 페이지 번호 (선택, 기본값 1)
     * @return 관광정보 JSON
     */
    @GetMapping(value = "/area-based", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getAreaBasedList(
            @RequestParam(required = false) String sigunguCode,
            @RequestParam(required = false) String contentTypeId,
            @RequestParam(defaultValue = "1") int pageNo) {

        String tourData = tourService.getAreaBasedList(sigunguCode, contentTypeId, pageNo);
        return ResponseEntity.ok(tourData);
    }

    /**
     * 경상북도 내 시군구 목록 조회 API
     * @return 시군구 목록 JSON
     */
    @GetMapping(value = "/sigungu-codes", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getSigunguCodeList() {
        String sigunguData = tourService.getSigunguCodes();
        return ResponseEntity.ok(sigunguData);
    }
}