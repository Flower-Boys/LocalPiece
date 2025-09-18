// 각 이미지의 URL과 추출된 메타데이터를 함께 담는 DTO입니다.
package com.flowerguys.localpiece.domain.ai.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

@Getter
@Builder
public class ImageMetadataDto {
    private String url;
    private String filename;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    private Double latitude;
    private Double longitude;

    // timestamp가 null일 경우를 대비한 안전한 getter
    public LocalDateTime getSafeTimestamp() {
        return timestamp != null ? timestamp : LocalDateTime.MIN;
    }
}
