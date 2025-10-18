package com.flowerguys.localpiece.domain.mypage.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PieceSaveRequestDto {
    private Long blogId; // 저장할 블로그의 ID만 받음
}