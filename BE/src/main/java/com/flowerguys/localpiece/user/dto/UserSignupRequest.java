package com.flowerguys.localpiece.user.dto;

import com.flowerguys.localpiece.user.entity.Gender;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserSignupRequest {
    private String email;
    private String password;
    private String nickname;
    private Gender gender;
}
