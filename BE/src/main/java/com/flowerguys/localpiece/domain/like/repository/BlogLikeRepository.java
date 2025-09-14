package com.flowerguys.localpiece.domain.like.repository;

import com.flowerguys.localpiece.domain.like.entity.BlogLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Set;

public interface BlogLikeRepository extends JpaRepository<BlogLike, Long> {
    Optional<BlogLike> findByUserIdAndBlogId(Long userId, Long blogId);
    boolean existsByUserIdAndBlogId(Long userId, Long blogId);

    // ✨ 특정 사용자가 '좋아요' 누른 모든 블로그의 ID를 조회하는 기능 추가
    @Query("SELECT bl.blog.id FROM BlogLike bl WHERE bl.user.id = :userId")
    Set<Long> findLikedBlogIdsByUserId(@Param("userId") Long userId);
}