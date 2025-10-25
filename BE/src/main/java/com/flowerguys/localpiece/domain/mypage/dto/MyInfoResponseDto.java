package com.flowerguys.localpiece.domain.mypage.dto;

import com.flowerguys.localpiece.domain.user.entity.User;
import lombok.Getter;

@Getter
public class MyInfoResponseDto {
    private String email;
    private String nickname;
    private String gender;

    public MyInfoResponseDto(User user) {
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.gender = user.getGender().name();
    }
}