package com.flowerguys.localpiece.user.service;

import com.flowerguys.localpiece.user.domain.User;
import com.flowerguys.localpiece.user.domain.UserRole;
import com.flowerguys.localpiece.user.dto.UserSignupRequest;
import com.flowerguys.localpiece.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public void signup(UserSignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .role(UserRole.USER)
                .build();

        userRepository.save(user);
    }
}
