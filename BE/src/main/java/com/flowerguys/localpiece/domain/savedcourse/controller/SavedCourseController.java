package com.flowerguys.localpiece.domain.savedcourse.controller;

import com.flowerguys.localpiece.domain.savedcourse.dto.CourseSaveRequestDto;
import com.flowerguys.localpiece.domain.savedcourse.dto.SavedCourseListResponseDto;
import com.flowerguys.localpiece.domain.savedcourse.service.SavedCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/saved-courses")
@RequiredArgsConstructor
public class SavedCourseController {

    private final SavedCourseService savedCourseService;

    @PostMapping
    public ResponseEntity<Map<String, Long>> saveCourse(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CourseSaveRequestDto requestDto) {
        Long courseId = savedCourseService.saveCourse(userDetails.getUsername(), requestDto);
        return ResponseEntity.ok(Map.of("courseId", courseId));
    }

    @GetMapping
    public ResponseEntity<List<SavedCourseListResponseDto>> getMySavedCourses(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<SavedCourseListResponseDto> savedCourses = savedCourseService.getSavedCourses(userDetails.getUsername());
        return ResponseEntity.ok(savedCourses);
    }
    
    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteSavedCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        savedCourseService.deleteSavedCourse(courseId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}