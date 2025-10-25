package com.flowerguys.localpiece.domain.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class AiRequestDto {
    private int id; 
    @JsonProperty("image_urls")
    private List<String> imageUrls;
    private String city;
    private boolean useV2;
}