package com.flowerguys.localpiece.domain.blog.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BlogCreateRequest {
    private String title;
    private String content;
    private boolean isPrivate;
}