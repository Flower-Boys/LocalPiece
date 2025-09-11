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

    // 관광정보 조회 API (반환 타입 변경)
    @GetMapping("/area-based")
    public ResponseEntity<List<TourItemDto>> getAreaBasedList(
            @RequestParam(required = false) String sigunguCode,
            @RequestParam(required = false) String contentTypeId,
            @RequestParam(defaultValue = "1") int pageNo) throws JsonProcessingException {
        
        List<TourItemDto> tourData = tourService.getAreaBasedList(sigunguCode, contentTypeId, pageNo);
        return ResponseEntity.ok(tourData);
    }

    // 시군구 코드 조회 API (반환 타입 변경)
    @GetMapping("/sigungu-codes")
    public ResponseEntity<List<SigunguCodeDto>> getSigunguCodeList() throws JsonProcessingException {
        List<SigunguCodeDto> sigunguData = tourService.getSigunguCodes();
        return ResponseEntity.ok(sigunguData);
    }
}