package com.flowerguys.localpiece.domain.piece.repository;

import com.flowerguys.localpiece.domain.piece.entity.Piece;
import com.flowerguys.localpiece.domain.user.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PieceRepository extends JpaRepository<Piece, Long> {

    // 사용자의 모든 조각(블로그) 목록 조회
    @Query("SELECT p FROM Piece p JOIN FETCH p.blog WHERE p.user.email = :email ORDER BY p.createdAt DESC")
    List<Piece> findAllByUserEmailWithBlog(@Param("email") String email);

    // 특정 조각 삭제를 위한 조회
    Optional<Piece> findByIdAndUserEmail(Long pieceId, String email);

    Optional<Piece> findByUserAndBlogId(User user, Long blogId);

    // 이미 저장된 조각인지 확인
    boolean existsByUserAndBlogId(User user, Long blogId);
}