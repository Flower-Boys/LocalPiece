package com.flowerguys.localpiece.domain.comment.dto;

import com.flowerguys.localpiece.domain.comment.entity.Comment;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CommentResponseDto {
    private Long commentId;
    private String content;
    private String author;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;

    public CommentResponseDto(Comment comment) {
        this.commentId = comment.getId();
        this.content = comment.getContent();
        this.author = comment.getUser().getNickname();
        this.createdAt = comment.getCreatedAt();
        this.modifiedAt = comment.getModifiedAt();
    }
}