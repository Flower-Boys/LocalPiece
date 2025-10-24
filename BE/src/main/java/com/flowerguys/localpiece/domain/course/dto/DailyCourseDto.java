package com.flowerguys.localpiece.domain.course.dto;

import com.flowerguys.localpiece.domain.savedcourse.entity.SavedDay; // ⬅️ SavedDay import 추가
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
public class DailyCourseDto {
    private int day;
    private String date;
    private List<PlaceDto> route;

    // ⬇️ 저장된 코스 상세 조회용 생성자 추가
    public DailyCourseDto(SavedDay savedDay) {
        this.day = savedDay.getDay();
        this.date = savedDay.getDate();
        this.route = savedDay.getRoute().stream()
                .map(PlaceDto::new) // PlaceDto가 SavedPlace를 받도록 수정 필요
                .collect(Collectors.toList());
    }
}