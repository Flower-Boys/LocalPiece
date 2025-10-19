package com.flowerguys.localpiece.domain.blog.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BlogUpdateRequest {

    @NotBlank(message = "제목은 비워둘 수 없습니다.")
    private String title;

    private Boolean isPrivate;
    
    private String thumbnail;

    @NotEmpty(message = "블로그 내용은 최소 하나 이상의 블록이 있어야 합니다.")
    @Valid
    private List<BlogContentDto> contents;
    private List<String> hashtags;
}