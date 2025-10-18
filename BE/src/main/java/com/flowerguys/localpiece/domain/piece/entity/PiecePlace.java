package com.flowerguys.localpiece.domain.piece.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PiecePlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "piece_day_id", nullable = false)
    private PieceDay pieceDay;

    @Column(name = "order_num", nullable = false)
    private int orderNum;

    @Column(nullable = false)
    private int contentId;

    private String type;
    private String name;
    private String category;
    private String address;
    private String arrivalTime;
    private String departureTime;
    private int durationMinutes;

    @Builder
    public PiecePlace(int orderNum, int contentId, String type, String name, String category,
                      String address, String arrivalTime, String departureTime, int durationMinutes) {
        this.orderNum = orderNum;
        this.contentId = contentId;
        this.type = type;
        this.name = name;
        this.category = category;
        this.address = address;
        this.arrivalTime = arrivalTime;
        this.departureTime = departureTime;
        this.durationMinutes = durationMinutes;
    }
}