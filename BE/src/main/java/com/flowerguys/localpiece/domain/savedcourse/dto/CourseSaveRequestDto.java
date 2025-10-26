package com.flowerguys.localpiece.domain.savedcourse.dto;

import com.flowerguys.localpiece.domain.course.dto.CourseOptionDto;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CourseSaveRequestDto {
    private String tripTitle;
    private CourseOptionDto courseOption;
}