package com.flowerguys.localpiece.domain.blog.repository;

import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.blog.entity.BlogContent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogContentRepository extends JpaRepository<BlogContent, Long> {
    // 블로그 수정 시 기존 블록들을 한번에 삭제하기 위한 메소드
    void deleteByBlog(Blog blog);
}