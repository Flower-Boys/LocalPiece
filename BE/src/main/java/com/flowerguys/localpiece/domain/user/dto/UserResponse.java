package com.flowerguys.localpiece.domain.user.dto;

import com.flowerguys.localpiece.domain.user.entity.Gender;
import com.flowerguys.localpiece.domain.user.entity.User;

import lombok.Getter;

@Getter
public class UserResponse {
    private Long id;
    private String email;
    private String nickname;
    private Gender gender;
    

    public UserResponse(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.gender = user.getGender();
    }
}
