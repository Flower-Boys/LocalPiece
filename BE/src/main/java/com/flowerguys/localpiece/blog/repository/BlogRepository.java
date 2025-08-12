package com.flowerguys.localpiece.blog.repository;

import com.flowerguys.localpiece.blog.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogRepository extends JpaRepository<Blog, Long> {
    // 앞으로 필요한 조회 메소드들을 여기에 추가하게 됩니다.
    // 예: List<Blog> findByUserAndIsDeletedFalse(User user);
}