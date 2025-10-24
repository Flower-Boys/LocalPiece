package com.flowerguys.localpiece.domain.savedcourse.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.BatchSize;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SavedDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "saved_course_id", nullable = false)
    private SavedCourse savedCourse;

    private int day;
    private String date;

    @OneToMany(mappedBy = "savedDay", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderNum ASC")
    @BatchSize(size = 100)
    private List<SavedPlace> route = new ArrayList<>();

    @Builder
    public SavedDay(int day, String date) {
        this.day = day;
        this.date = date;
    }

    public void addPlace(SavedPlace place) {
        this.route.add(place);
        place.setSavedDay(this);
    }
}