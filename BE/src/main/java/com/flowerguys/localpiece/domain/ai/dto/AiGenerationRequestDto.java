// 이 파일은 AI 서버로 보낼 '완벽한' 데이터 구조를 정의합니다.
package com.flowerguys.localpiece.domain.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class AiGenerationRequestDto {
    private String id; // 고유 요청 ID (UUID)
    private List<ImageMetadataDto> images; // 이미지 정보 목록 (메타데이터 포함)
    private String city;
}
