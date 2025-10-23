package com.flowerguys.localpiece.domain.blog.dto;

import com.flowerguys.localpiece.domain.blog.entity.Blog;
import lombok.Getter;
import com.flowerguys.localpiece.domain.comment.dto.CommentResponseDto;
import com.flowerguys.localpiece.domain.comment.entity.Comment;
import com.flowerguys.localpiece.domain.piece.entity.Piece;

import java.util.Comparator;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Getter
public class BlogResponse {
    private Long id;
    private String title;
    private boolean isPrivate;
    private int viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt; 
    private String author;
    private List<BlogContentDto> contents;
    private List<CommentResponseDto> comments;
    private int likeCount;
    private boolean isLikedByCurrentUser;
    private boolean isSavedAsPiece;
    private Long pieceId;
    private List<String> hashtags;

    public BlogResponse(Blog blog) {
        this(blog, false, Optional.empty()); 
    }

    public BlogResponse(Blog blog, boolean isLiked, Optional<Piece> pieceOptional) {
        this.id = blog.getId();
        this.title = blog.getTitle();
        this.isPrivate = blog.isPrivate();
        this.viewCount = blog.getViewCount();
        this.createdAt = blog.getCreatedAt();
        this.modifiedAt = blog.getModifiedAt(); // ✨ Blog가 BaseTimeEntity를 상속하므로 사용 가능
        this.author = blog.getUser().getNickname();
        
        this.contents = blog.getContents().stream()
                .map(entity -> {
                    BlogContentDto dto = new BlogContentDto();
                    dto.setSequence(entity.getSequence());
                    dto.setContentType(entity.getContentType());
                    dto.setContent(entity.getContent());
                    return dto;
                })
                .collect(Collectors.toList());
        this.comments = blog.getComments().stream()
                .sorted(Comparator.comparing(Comment::getCreatedAt)) // 작성순으로 정렬
                .map(CommentResponseDto::new)
                .collect(Collectors.toList());
        
        this.likeCount = blog.getLikes().size();
        this.isLikedByCurrentUser = isLiked;
        this.isSavedAsPiece = pieceOptional.isPresent();
        this.pieceId = pieceOptional.map(Piece::getId).orElse(null);
        this.hashtags = blog.getHashtags().stream()
                .map(blogHashtag -> blogHashtag.getHashtag().getName())
                .collect(Collectors.toList());
    }
}