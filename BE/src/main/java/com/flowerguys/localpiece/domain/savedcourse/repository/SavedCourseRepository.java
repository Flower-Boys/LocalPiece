package com.flowerguys.localpiece.domain.savedcourse.repository;

import com.flowerguys.localpiece.domain.savedcourse.entity.SavedCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SavedCourseRepository extends JpaRepository<SavedCourse, Long> {
    List<SavedCourse> findAllByUserEmailOrderByCreatedAtDesc(String email);
    Optional<SavedCourse> findByIdAndUserEmail(Long id, String email);
}