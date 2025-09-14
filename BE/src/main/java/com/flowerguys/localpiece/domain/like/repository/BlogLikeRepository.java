package com.flowerguys.localpiece.domain.like.repository;

import com.flowerguys.localpiece.domain.like.entity.BlogLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlogLikeRepository extends JpaRepository<BlogLike, Long> {
    Optional<BlogLike> findByUserIdAndBlogId(Long userId, Long blogId);
    boolean existsByUserIdAndBlogId(Long userId, Long blogId);
}