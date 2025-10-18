package com.flowerguys.localpiece.domain.mypage.dto;

import com.flowerguys.localpiece.domain.course.dto.CourseOptionDto;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PieceSaveRequestDto {
    private String tripTitle;
    private CourseOptionDto courseOption;
}