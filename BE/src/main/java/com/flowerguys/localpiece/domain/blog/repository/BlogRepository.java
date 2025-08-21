package com.flowerguys.localpiece.domain.blog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.flowerguys.localpiece.domain.blog.entity.Blog;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlogRepository extends JpaRepository<Blog, Long> {
    @Modifying
    @Query("update Blog b set b.viewCount = b.viewCount + 1 where b.id = :id")
    int updateViewCount(@Param("id") Long id);

    List<Blog> findAllByIsDeletedFalseAndIsPrivateFalseOrderByCreatedAtDesc();
}