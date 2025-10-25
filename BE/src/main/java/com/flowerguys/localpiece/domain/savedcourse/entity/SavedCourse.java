package com.flowerguys.localpiece.domain.savedcourse.entity;

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
public class SavedCourse extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "saved_course_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String tripTitle;

    @Column(nullable = false)
    private String themeTitle;

    @OneToMany(mappedBy = "savedCourse", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("day ASC")
    private List<SavedDay> days = new ArrayList<>();

    @Builder
    public SavedCourse(User user, String tripTitle, String themeTitle) {
        this.user = user;
        this.tripTitle = tripTitle;
        this.themeTitle = themeTitle;
    }

    public void addDay(SavedDay day) {
        this.days.add(day);
        day.setSavedCourse(this);
    }
}