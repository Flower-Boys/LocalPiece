package com.flowerguys.localpiece.domain.comment.repository;

import com.flowerguys.localpiece.domain.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}