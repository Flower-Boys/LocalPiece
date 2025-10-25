package com.flowerguys.localpiece.domain.hashtag.repository;

import com.flowerguys.localpiece.domain.hashtag.entity.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HashtagRepository extends JpaRepository<Hashtag, Long> {
    Optional<Hashtag> findByName(String name);
}