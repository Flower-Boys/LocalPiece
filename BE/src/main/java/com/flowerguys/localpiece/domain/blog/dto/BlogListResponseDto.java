package com.flowerguys.localpiece.domain.blog.dto;

import com.flowerguys.localpiece.domain.blog.entity.Blog;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class BlogListResponseDto {

    private Long id;
    private String title;
    private String author;
    private String thumbnail;
    private LocalDateTime createdAt;
    private int viewCount;
    private int likeCount;
    private int commentCount;
    private boolean isLikedByCurrentUser;
    private boolean isPrivate;

    public BlogListResponseDto(Blog blog, boolean isLiked) {
        this.id = blog.getId();
        this.title = blog.getTitle();
        this.author = blog.getUser().getNickname();
        this.thumbnail = blog.getThumbnail();
        this.createdAt = blog.getCreatedAt();
        this.viewCount = blog.getViewCount();
        this.likeCount = blog.getLikes().size();
        this.commentCount = blog.getComments().size();
        this.isLikedByCurrentUser = isLiked;
        this.isPrivate = blog.isPrivate();
    }
}