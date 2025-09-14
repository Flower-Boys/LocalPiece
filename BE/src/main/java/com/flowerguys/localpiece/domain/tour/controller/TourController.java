package com.flowerguys.localpiece.domain.tour.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.flowerguys.localpiece.domain.tour.dto.SigunguCodeDto;
import com.flowerguys.localpiece.domain.tour.dto.TourItemDto;
import com.flowerguys.localpiece.domain.tour.service.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tour")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    // 관광정보 조회 API (모든 파라미터 추가)
    @GetMapping("/area-based")
    public ResponseEntity<List<TourItemDto>> getAreaBasedList(
            @RequestParam(required = false) String sigunguCode,
            @RequestParam(required = false) String contentTypeId,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "12") int numOfRows,
            @RequestParam(defaultValue = "A") String arrange, // A=제목순, C=수정일순, D=생성일순
            @RequestParam(required = false) String cat1,
            @RequestParam(required = false) String cat2,
            @RequestParam(required = false) String cat3,
            @RequestParam(required = false) String lclsSystm1,
            @RequestParam(required = false) String lclsSystm2,
            @RequestParam(required = false) String lclsSystm3,
            @RequestParam(required = false) String modifiedtime) throws JsonProcessingException {

        // 서비스 메소드에 모든 파라미터를 전달
        List<TourItemDto> tourData = tourService.getAreaBasedList(
                sigunguCode, contentTypeId, pageNo, numOfRows, arrange,
                cat1, cat2, cat3, lclsSystm1, lclsSystm2, lclsSystm3, modifiedtime);

        return ResponseEntity.ok(tourData);
    }

    // 시군구 코드 조회 API (반환 타입 변경)
    @GetMapping("/sigungu-codes")
    public ResponseEntity<List<SigunguCodeDto>> getSigunguCodeList() throws JsonProcessingException {
        List<SigunguCodeDto> sigunguData = tourService.getSigunguCodes();
        return ResponseEntity.ok(sigunguData);
    }
}