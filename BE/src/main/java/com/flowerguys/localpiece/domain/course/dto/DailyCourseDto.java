package com.flowerguys.localpiece.domain.course.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

import com.flowerguys.localpiece.domain.piece.entity.PieceDay;

@Getter
@NoArgsConstructor
public class DailyCourseDto {
    private int day;
    private String date;
    private List<PlaceDto> route;

    public DailyCourseDto(PieceDay pieceDay) {
        this.day = pieceDay.getDay();
        this.date = pieceDay.getDate();
        this.route = pieceDay.getRoute().stream()
                .map(PlaceDto::new)
                .collect(Collectors.toList());
    }
}