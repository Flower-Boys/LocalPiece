package com.flowerguys.localpiece.domain.mypage.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PieceSaveRequestDto {
    private Long blogId; 
    private String city;
}