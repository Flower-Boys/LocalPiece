package com.flowerguys.localpiece.user.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users") // PostgreSQL에서 "user"는 예약어라서 "users"로 테이블 이름 설정!
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // PostgreSQL auto-increment
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password; // 암호화된 비밀번호 저장

    @Column(nullable = false)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;
}
