package com.flowerguys.localpiece.domain.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flowerguys.localpiece.domain.blog.entity.Blog;

public interface BlogRepository extends JpaRepository<Blog, Long> {
    // 앞으로 필요한 조회 메소드들을 여기에 추가하게 됩니다.
    // 예: List<Blog> findByUserAndIsDeletedFalse(User user);
}