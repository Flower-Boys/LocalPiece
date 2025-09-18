package com.flowerguys.localpiece.domain.hashtag.repository;

import com.flowerguys.localpiece.domain.hashtag.entity.BlogHashtag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogHashtagRepository extends JpaRepository<BlogHashtag, Long> {
}