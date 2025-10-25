package com.flowerguys.localpiece.domain.blog.dto;

import com.flowerguys.localpiece.domain.blog.entity.ContentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter // 프론트엔드에서 JSON을 객체로 변환하려면 Setter가 필요합니다.
public class BlogContentDto {

    @NotNull(message = "블록 순서는 필수입니다.")
    private Integer sequence;

    @NotNull(message = "블록 타입은 필수입니다.")
    private ContentType contentType;

    @NotBlank(message = "블록 내용은 비워둘 수 없습니다.")
    private String content; // 텍스트 내용 또는 이미지 URL
}