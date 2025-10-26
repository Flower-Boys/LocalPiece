package com.flowerguys.localpiece.domain.savedcourse.dto;

import com.flowerguys.localpiece.domain.savedcourse.entity.SavedCourse;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class SavedCourseListResponseDto {

    private Long courseId;
    private String tripTitle;
    private String themeTitle;
    private String authorNickname;
    private String thumbnailUrl;
    private LocalDateTime createdAt; // 코스를 저장한 날짜

    public SavedCourseListResponseDto(SavedCourse savedCourse) {
        this.courseId = savedCourse.getId();
        this.tripTitle = savedCourse.getTripTitle();
        this.themeTitle = savedCourse.getThemeTitle();
        this.authorNickname = savedCourse.getUser() != null ? savedCourse.getUser().getNickname() : "알 수 없음";
        this.thumbnailUrl = savedCourse.getThumbnailUrl();
        this.createdAt = savedCourse.getCreatedAt();
    }
}