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

    // N+1 문제를 해결하기 위해 contents를 함께 조회하는 Fetch Join 사용
    @Query("SELECT b FROM Blog b LEFT JOIN FETCH b.contents WHERE b.id = :blogId AND b.isDeleted = false")
    Optional<Blog> findWithContentsById(@Param("blogId") Long blogId);

    // JPQL을 사용하여 조회수 업데이트
    @Modifying 
    @Query("UPDATE Blog b SET b.viewCount = b.viewCount + 1 WHERE b.id = :blogId")
    void updateViewCount(@Param("blogId") Long blogId);
}