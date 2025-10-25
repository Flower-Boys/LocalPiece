package com.flowerguys.localpiece.domain.savedcourse.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SavedPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "saved_day_id", nullable = false)
    private SavedDay savedDay;

    @Column(name = "order_num")
    private int orderNum;
    private int contentId;
    private String type;
    private String name;
    private String category;
    private String address;
    private String arrivalTime;
    private String departureTime;
    private int durationMinutes;

    @Builder
    public SavedPlace(int orderNum, int contentId, String type, String name, String category,
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