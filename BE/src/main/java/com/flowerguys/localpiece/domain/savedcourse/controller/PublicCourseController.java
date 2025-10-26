package com.flowerguys.localpiece.domain.savedcourse.controller;

import com.flowerguys.localpiece.domain.savedcourse.dto.SavedCourseDetailResponseDto;
import com.flowerguys.localpiece.domain.savedcourse.dto.SavedCourseListResponseDto;
import com.flowerguys.localpiece.domain.savedcourse.service.SavedCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault; // ⬅️ import 추가
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/saved-courses") // ⬅️ 공개 API 경로
@RequiredArgsConstructor
public class PublicCourseController {

    private final SavedCourseService savedCourseService;

    // 공개 저장 코스 목록 조회 (페이징 기본값: page 0, size 10)
    @GetMapping
    public ResponseEntity<Page<SavedCourseListResponseDto>> getPublicSavedCourses(
            @PageableDefault(size = 10) Pageable pageable) { // ⬅️ 페이징 파라미터 추가
        Page<SavedCourseListResponseDto> savedCoursesPage = savedCourseService.getPublicSavedCourses(pageable);
        return ResponseEntity.ok(savedCoursesPage);
    }

    // 공개 저장 코스 상세 조회
    @GetMapping("/{courseId}")
    public ResponseEntity<SavedCourseDetailResponseDto> getPublicSavedCourseDetails(
            @PathVariable Long courseId) {
        SavedCourseDetailResponseDto courseDetails = savedCourseService.getPublicSavedCourseDetails(courseId);
        return ResponseEntity.ok(courseDetails);
    }
}