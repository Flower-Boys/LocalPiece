package com.flowerguys.localpiece.domain.course.controller;

import com.flowerguys.localpiece.domain.course.dto.CourseRequestDto;
import com.flowerguys.localpiece.domain.course.dto.CourseResponseDto;
import com.flowerguys.localpiece.domain.course.dto.ReplacePlaceRequestDto;
import com.flowerguys.localpiece.domain.course.dto.CourseOptionDto;
import com.flowerguys.localpiece.domain.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping("/generate")
    public ResponseEntity<CourseResponseDto> generateCourse(@RequestBody CourseRequestDto requestDto) {
        CourseResponseDto response = courseService.generateCourse(requestDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/replace-place")
    public ResponseEntity<CourseOptionDto> replacePlaceInCourse(@RequestBody ReplacePlaceRequestDto requestDto) {
        CourseOptionDto updatedCourse = courseService.replacePlace(requestDto);
        return ResponseEntity.ok(updatedCourse);
    }
}