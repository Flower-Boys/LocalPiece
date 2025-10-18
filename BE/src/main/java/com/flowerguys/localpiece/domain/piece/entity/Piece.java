package com.flowerguys.localpiece.domain.piece.entity;

import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Piece extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "piece_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String tripTitle; // "당신만을 위한 경상북도..."

    @Column(nullable = false)
    private String themeTitle; // "👍 인기만점! 베스트 코스"

    @OneToMany(mappedBy = "piece", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("day ASC")
    private List<PieceDay> days = new ArrayList<>();

    @Builder
    public Piece(User user, String tripTitle, String themeTitle) {
        this.user = user;
        this.tripTitle = tripTitle;
        this.themeTitle = themeTitle;
    }

    public void addDay(PieceDay day) {
        this.days.add(day);
        day.setPiece(this);
    }
}