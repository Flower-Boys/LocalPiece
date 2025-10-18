package com.flowerguys.localpiece.domain.piece.repository;

import com.flowerguys.localpiece.domain.piece.entity.Piece;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PieceRepository extends JpaRepository<Piece, Long> {
    List<Piece> findAllByUserEmailOrderByCreatedAtDesc(String email);

    Optional<Piece> findByIdAndUserEmail(Long id, String email);
}