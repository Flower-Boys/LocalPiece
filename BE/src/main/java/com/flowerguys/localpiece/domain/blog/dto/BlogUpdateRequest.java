package com.flowerguys.localpiece.domain.blog.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BlogUpdateRequest {
    @NotBlank(message = "제목은 비워둘 수 없습니다.")
    private String title;

    @NotBlank(message = "내용은 비워둘 수 없습니다.")
    private String content;
    
    private Boolean isPrivate; // ⬅️ Boolean (객체 타입)으로 선언하여 null 값을 받을 수 있게 함

    private List<Long> idsToDelete;
}