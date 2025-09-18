package com.flowerguys.localpiece.domain.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SimpleMultipartFile {
    private String originalFilename;
    private String contentType;
    private byte[] bytes;
}