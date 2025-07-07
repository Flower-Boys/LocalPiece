package com.flowerguys.localpiece.user.controller;

import com.flowerguys.localpiece.user.dto.UserSignupRequest;
import com.flowerguys.localpiece.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody UserSignupRequest request) {
        userService.signup(request);
        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }
}
