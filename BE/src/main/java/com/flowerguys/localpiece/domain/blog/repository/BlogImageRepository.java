package com.flowerguys.localpiece.domain.blog.repository;

import com.flowerguys.localpiece.domain.blog.entity.BlogImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogImageRepository extends JpaRepository<BlogImage, Long> {
    // 앞으로 필요한 조회 메소드들을 여기에 추가하게 됩니다.
}