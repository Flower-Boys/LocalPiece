package com.flowerguys.localpiece.domain.blog.dto;

import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.blog.entity.BlogImage;
import com.flowerguys.localpiece.domain.user.dto.UserResponse;

import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class BlogResponse {
    private Long id;
    private UserResponse user; // User 엔티티 대신 UserResponse 사용
    private String title;
    private String content;
    private boolean isPrivate;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;

    public BlogResponse(Blog blog) {
        this.id = blog.getId();
        this.user = new UserResponse(blog.getUser()); // User 객체를 DTO로 변환
        this.title = blog.getTitle();
        this.content = blog.getContent();
        this.isPrivate = blog.isPrivate();
        this.imageUrls = blog.getImages().stream()
                             .map(BlogImage::getImageUrl)
                             .collect(Collectors.toList());
        this.createdAt = blog.getCreatedAt();
        this.modifiedAt = blog.getModifiedAt();
    }
}