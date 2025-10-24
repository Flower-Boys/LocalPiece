package com.flowerguys.localpiece.domain.savedcourse.repository;

import com.flowerguys.localpiece.domain.savedcourse.entity.SavedCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; 
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface SavedCourseRepository extends JpaRepository<SavedCourse, Long> {
    List<SavedCourse> findAllByUserEmailOrderByCreatedAtDesc(String email);
    @Query("SELECT DISTINCT sc FROM SavedCourse sc " +
           "LEFT JOIN FETCH sc.days d " +
           "LEFT JOIN FETCH d.route " +
           "WHERE sc.id = :courseId AND sc.user.email = :email")
    Optional<SavedCourse> findDetailsByIdAndUserEmail(@Param("courseId") Long courseId, @Param("email") String email);
    Optional<SavedCourse> findByIdAndUserEmail(Long id, String email);
}