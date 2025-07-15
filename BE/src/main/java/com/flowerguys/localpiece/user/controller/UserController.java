package com.flowerguys.localpiece.user.controller;

import com.flowerguys.localpiece.user.dto.LoginRequest;
import com.flowerguys.localpiece.user.dto.LoginResponse;
import com.flowerguys.localpiece.user.dto.UserSignupRequest;
import com.flowerguys.localpiece.user.entity.User;
import com.flowerguys.localpiece.user.repository.UserRepository;
import com.flowerguys.localpiece.config.jwt.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseCookie;

import org.springframework.http.HttpHeaders;



@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody UserSignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .gender(request.getGender())
                .build();

        userRepository.save(user);
        return ResponseEntity.ok("회원가입 완료");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        // HttpOnly 쿠키로 Refresh Token 설정
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true) // HTTPS가 아닐 경우 false로 설정
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7일
                .sameSite("Strict") // or "Lax"
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .body(new LoginResponse(accessToken));
    }


    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // JWT 기반은 서버가 상태를 갖고 있지 않기 때문에,
        // 프론트에서 토큰을 지우면 로그아웃이 완료됨
        return ResponseEntity.ok("로그아웃 되었습니다.");
    }

}
