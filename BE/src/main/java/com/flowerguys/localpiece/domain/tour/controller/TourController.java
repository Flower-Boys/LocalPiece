package com.flowerguys.localpiece.domain.tour.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.flowerguys.localpiece.domain.tour.dto.CategoryCodeDto;
import com.flowerguys.localpiece.domain.tour.dto.EventItemDto;
import com.flowerguys.localpiece.domain.tour.dto.LdongCodeDto;
import com.flowerguys.localpiece.domain.tour.dto.TourItemDto;
import com.flowerguys.localpiece.domain.tour.dto.TourItemWithDistDto;
import com.flowerguys.localpiece.domain.tour.service.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.flowerguys.localpiece.domain.tour.dto.PetTourInfoDto;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@RestController
@RequestMapping("/api/tour")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    @GetMapping("/area-based")
    public ResponseEntity<List<TourItemDto>> getAreaBasedList(
            @RequestParam(required = false) String sigunguCode,
            @RequestParam(required = false) String contentTypeId,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "12") int numOfRows,
            @RequestParam(defaultValue = "A") String arrange,
            @RequestParam(required = false) String lclsSystm1,
            @RequestParam(required = false) String lclsSystm2,
            @RequestParam(required = false) String lclsSystm3,
            @RequestParam(required = false) String modifiedtime) throws JsonProcessingException {

        List<TourItemDto> tourData = tourService.getAreaBasedList(
                sigunguCode, contentTypeId, pageNo, numOfRows, arrange,
                lclsSystm1, lclsSystm2, lclsSystm3, modifiedtime);

        return ResponseEntity.ok(tourData);
    }

    /**
     * 법정동 코드 조회 Controller (기존 /sigungu-codes -> /ldong-codes)
     * ldongAreaCd 파라미터가 없으면 시/도 목록을, 있으면 해당 시/도의 시/군/구 목록을 반환합니다.
     */
    @GetMapping("/ldong-codes")
    public ResponseEntity<List<LdongCodeDto>> getLdongCodeList(
            @RequestParam(required = false) String ldongAreaCd,
            @RequestParam(defaultValue = "N") String lDongListYn) throws JsonProcessingException {
        // 경북 서비스이므로 기본 ldongAreaCd를 47(경북)로 설정
        String targetAreaCd = (ldongAreaCd == null) ? "47" : ldongAreaCd;
        List<LdongCodeDto> ldongData = tourService.getLdongCodeList(targetAreaCd, lDongListYn);
        return ResponseEntity.ok(ldongData);
    }

    /**
     * 분류체계 코드 조회 Controller
     * 파라미터가 없으면 대분류 목록을, 파라미터에 따라 중/소분류 목록을 반환합니다.
     */
    @GetMapping("/category-codes")
    public ResponseEntity<List<CategoryCodeDto>> getCategoryCodeList(
            @RequestParam(required = false) String lclsSystm1,
            @RequestParam(required = false) String lclsSystm2,
            @RequestParam(defaultValue = "N") String lclsSystmListYn) throws JsonProcessingException {
        List<CategoryCodeDto> categoryData = tourService.getCategoryCodeList(lclsSystm1, lclsSystm2, lclsSystmListYn);
        return ResponseEntity.ok(categoryData);
    }

    /**
     * 위치기반 관광정보 조회 Controller
     */
    @GetMapping("/location-based")
    public ResponseEntity<List<TourItemWithDistDto>> getLocationBasedList(
            @RequestParam String mapX,
            @RequestParam String mapY,
            @RequestParam(defaultValue = "1000") int radius, // 기본 반경 1km
            @RequestParam(defaultValue = "E") String arrange, // E=거리순
            @RequestParam(required = false) String contentTypeId,
            @RequestParam(required = false) String lclsSystm1,
            @RequestParam(required = false) String lclsSystm2,
            @RequestParam(required = false) String lclsSystm3,
            @RequestParam(required = false) String modifiedtime) throws JsonProcessingException {

        List<TourItemWithDistDto> tourData = tourService.getLocationBasedList(
                mapX, mapY, radius, arrange, contentTypeId,
                lclsSystm1, lclsSystm2, lclsSystm3, modifiedtime);
        
        return ResponseEntity.ok(tourData);
    }

    /**
     * 키워드 검색 조회 Controller
     */
    @GetMapping("/keyword-search")
    public ResponseEntity<List<TourItemDto>> searchKeyword(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "A") String arrange,
            @RequestParam(required = false) String contentTypeId,
            @RequestParam(required = false) String lclsSystm1,
            @RequestParam(required = false) String lclsSystm2,
            @RequestParam(required = false) String lclsSystm3,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "12") int numOfRows) throws JsonProcessingException {

        List<TourItemDto> tourData = tourService.searchKeyword(
                keyword, arrange, contentTypeId,
                lclsSystm1, lclsSystm2, lclsSystm3,
                pageNo, numOfRows);
        
        return ResponseEntity.ok(tourData);
    }

    /**
     * 행사정보 조회 Controller
     */
    @GetMapping("/events")
    public ResponseEntity<List<EventItemDto>> searchFestival(
            @RequestParam String eventStartDate, // YYYYMMDD 형식
            @RequestParam(required = false) String eventEndDate, // YYYYMMDD 형식
            @RequestParam(defaultValue = "A") String arrange,
            @RequestParam(required = false) String lclsSystm1,
            @RequestParam(required = false) String lclsSystm2,
            @RequestParam(required = false) String lclsSystm3,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "12") int numOfRows) throws JsonProcessingException {

        List<EventItemDto> eventData = tourService.searchFestival(
                eventStartDate, eventEndDate, arrange,
                lclsSystm1, lclsSystm2, lclsSystm3,
                pageNo, numOfRows);
        
        return ResponseEntity.ok(eventData);
    }

    /**
     * 숙박정보 조회 Controller
     */
    @GetMapping("/stays")
    public ResponseEntity<List<TourItemDto>> searchStay(
            @RequestParam(defaultValue = "A") String arrange,
            @RequestParam(required = false) String lclsSystm1,
            @RequestParam(required = false) String lclsSystm2,
            @RequestParam(required = false) String lclsSystm3,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "12") int numOfRows) throws JsonProcessingException {

        List<TourItemDto> stayData = tourService.searchStay(
                arrange, lclsSystm1, lclsSystm2, lclsSystm3,
                pageNo, numOfRows);
        
        return ResponseEntity.ok(stayData);
    }

    /**
     * 반려동물 동반여행 정보 조회 Controller
     */
    @GetMapping("/pet-friendly-info/{contentId}")
    public ResponseEntity<List<PetTourInfoDto>> getPetTourInfo(
            @PathVariable String contentId) throws JsonProcessingException {

        List<PetTourInfoDto> petTourInfo = tourService.getPetTourInfo(contentId);
        
        return ResponseEntity.ok(petTourInfo);
    }
}