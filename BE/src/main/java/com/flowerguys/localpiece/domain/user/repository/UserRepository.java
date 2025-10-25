package com.flowerguys.localpiece.domain.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flowerguys.localpiece.domain.user.entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // 일반 조회
    Optional<User> findByEmail(String email);

    // 로그인/인증용: 삭제되지 않은 유저만
    Optional<User> findByEmailAndIsDeletedFalse(String email);
}
