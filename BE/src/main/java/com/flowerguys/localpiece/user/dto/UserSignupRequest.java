package com.flowerguys.localpiece.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserSignupRequest {
    private String email;
    private String password;
    private String nickname;
}
