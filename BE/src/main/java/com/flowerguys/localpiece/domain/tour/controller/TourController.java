package com.flowerguys.localpiece.domain.tour.controller;

import com.flowerguys.localpiece.domain.tour.service.TourService;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/area-based")
    public ResponseEntity<String> getAreaBasedList(@RequestParam(defaultValue = "1") String areaCode) {
        String tourData = tourService.getAreaBasedList(areaCode);
        return ResponseEntity.ok(tourData);
    }
}
