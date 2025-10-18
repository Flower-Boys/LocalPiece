package com.flowerguys.localpiece.domain.piece.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PieceDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "piece_id", nullable = false)
    private Piece piece;

    @Column(nullable = false)
    private int day;

    @Column(nullable = false)
    private String date;

    @OneToMany(mappedBy = "pieceDay", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderNum ASC")
    private List<PiecePlace> route = new ArrayList<>();

    @Builder
    public PieceDay(int day, String date) {
        this.day = day;
        this.date = date;
    }

    public void addPlace(PiecePlace place) {
        this.route.add(place);
        place.setPieceDay(this);
    }
}