package com.flowerguys.localpiece.domain.mypage.dto;

import com.flowerguys.localpiece.domain.piece.entity.Piece;
import lombok.Getter;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class PieceResponseDto {
    private Long pieceId;
    private String tripTitle;
    private String themeTitle;
    private List<DailyCourseDto> days;

    public PieceResponseDto(Piece piece) {
        this.pieceId = piece.getId();
        this.tripTitle = piece.getTripTitle();
        this.themeTitle = piece.getThemeTitle();
        this.days = piece.getDays().stream()
                .map(DailyCourseDto::new)
                .collect(Collectors.toList());
    }
}