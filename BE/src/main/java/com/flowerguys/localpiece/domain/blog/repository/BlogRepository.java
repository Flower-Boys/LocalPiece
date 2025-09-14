package com.flowerguys.localpiece.domain.blog.repository;

import com.flowerguys.localpiece.domain.blog.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BlogRepository extends JpaRepository<Blog, Long> {
    
    List<Blog> findAllByIsDeletedFalseAndIsPrivateFalseOrderByCreatedAtDesc();

    // ✨ 1. 이 메소드는 수정/삭제 로직을 위해 그대로 유지합니다.
    @Query("SELECT b FROM Blog b LEFT JOIN FETCH b.contents WHERE b.id = :blogId AND b.isDeleted = false")
    Optional<Blog> findWithContentsById(@Param("blogId") Long blogId);

    // ✨ 2. 상세 조회 시 N+1 문제 해결을 위해 이 메소드를 '추가'합니다.
    @Query("SELECT DISTINCT b FROM Blog b " +
           "LEFT JOIN FETCH b.contents " +
           "LEFT JOIN FETCH b.comments c " +
           "LEFT JOIN FETCH c.user " +
           "LEFT JOIN FETCH b.likes " +
           "WHERE b.id = :blogId AND b.isDeleted = false")
    Optional<Blog> findWithDetailsById(@Param("blogId") Long blogId);

    @Modifying 
    @Query("UPDATE Blog b SET b.viewCount = b.viewCount + 1 WHERE b.id = :blogId")
    void updateViewCount(@Param("blogId") Long blogId);

    // ✨ 삭제되지 않은 블로그만 ID로 조회하는 메소드 추가
    @Query("SELECT b FROM Blog b WHERE b.id = :blogId AND b.isDeleted = false")
    Optional<Blog> findActiveById(@Param("blogId") Long blogId);
}