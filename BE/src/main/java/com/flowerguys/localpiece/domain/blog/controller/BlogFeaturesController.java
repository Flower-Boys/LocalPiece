package com.flowerguys.localpiece.domain.blog.controller;

import com.flowerguys.localpiece.domain.comment.dto.CommentRequestDto;
import com.flowerguys.localpiece.domain.comment.dto.CommentResponseDto;
import com.flowerguys.localpiece.domain.comment.service.CommentService;
import com.flowerguys.localpiece.domain.like.service.LikeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/blogs/{blogId}")
@RequiredArgsConstructor
public class BlogFeaturesController {

    private final CommentService commentService;
    private final LikeService likeService;

    // == 댓글 API == //
    @PostMapping("/comments")
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable Long blogId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CommentRequestDto requestDto) {
        String email = userDetails.getUsername();
        CommentResponseDto responseDto = commentService.createComment(blogId, email, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment(
            @PathVariable Long blogId, // blogId는 경로 일관성을 위해 유지
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CommentRequestDto requestDto) {
        String email = userDetails.getUsername();
        CommentResponseDto responseDto = commentService.updateComment(commentId, email, requestDto);
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long blogId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        commentService.deleteComment(commentId, email);
        return ResponseEntity.noContent().build();
    }
    
    // == 좋아요 API == //
    @PostMapping("/like")
    public ResponseEntity<Map<String, String>> toggleLike(
            @PathVariable Long blogId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        String message = likeService.toggleLike(blogId, email);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
