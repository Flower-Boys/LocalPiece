package com.flowerguys.localpiece.domain.blog.repository;

import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.blog.entity.BlogImage;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogImageRepository extends JpaRepository<BlogImage, Long> {
    List<BlogImage> findAllByBlogAndIdIn(Blog blog, List<Long> ids);
}