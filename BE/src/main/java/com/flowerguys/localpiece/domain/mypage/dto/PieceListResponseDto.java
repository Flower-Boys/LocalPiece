package com.flowerguys.localpiece.domain.mypage.dto;

import com.flowerguys.localpiece.domain.piece.entity.Piece;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class PieceListResponseDto {
    private Long pieceId;
    private Long blogId;
    private String title;
    private String thumbnail;
    private LocalDateTime createdAt; // 조각으로 저장한 날짜

    public PieceListResponseDto(Piece piece) {
        this.pieceId = piece.getId();
        this.blogId = piece.getBlog().getId();
        this.title = piece.getBlog().getTitle();
        this.thumbnail = piece.getBlog().getThumbnail();
        this.createdAt = piece.getCreatedAt();
    }
}