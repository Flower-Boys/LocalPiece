package com.flowerguys.localpiece.domain.savedcourse.dto;

import com.flowerguys.localpiece.domain.course.dto.DailyCourseDto; // 코스 상세 DTO 재활용
import com.flowerguys.localpiece.domain.savedcourse.entity.SavedCourse;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class SavedCourseDetailResponseDto {

    private Long courseId;
    private String tripTitle;
    private String themeTitle;
    private LocalDateTime createdAt; // 저장된 시간
    private List<DailyCourseDto> days; // ⬅️ 상세 일정을 담을 리스트

    public SavedCourseDetailResponseDto(SavedCourse savedCourse) {
        this.courseId = savedCourse.getId();
        this.tripTitle = savedCourse.getTripTitle();
        this.themeTitle = savedCourse.getThemeTitle();
        this.createdAt = savedCourse.getCreatedAt();
        // Entity 목록을 DTO 목록으로 변환 (DailyCourseDto의 생성자 활용)
        this.days = savedCourse.getDays().stream()
                .map(DailyCourseDto::new) // SavedDay Entity를 DailyCourseDto로 변환
                .collect(Collectors.toList());
    }
}