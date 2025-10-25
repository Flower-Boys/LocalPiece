package com.flowerguys.localpiece.domain.savedcourse.repository;

import com.flowerguys.localpiece.domain.savedcourse.entity.SavedCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; 
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page; 
import org.springframework.data.domain.Pageable;

public interface SavedCourseRepository extends JpaRepository<SavedCourse, Long> {
    List<SavedCourse> findAllByUserEmailOrderByCreatedAtDesc(String email);
    @Query("SELECT DISTINCT sc FROM SavedCourse sc " +
           "LEFT JOIN FETCH sc.days d " +
           "WHERE sc.id = :courseId AND sc.user.email = :email")
    Optional<SavedCourse> findDetailsByIdAndUserEmail(@Param("courseId") Long courseId, @Param("email") String email);
    Optional<SavedCourse> findByIdAndUserEmail(Long id, String email);

    // ⬇️ 공개 목록 조회 (User 정보 포함, 페이징 적용)
    @Query(value = "SELECT sc FROM SavedCourse sc JOIN FETCH sc.user u ORDER BY sc.createdAt DESC", // ⬅️ ORDER BY 추가
           countQuery = "SELECT count(sc) FROM SavedCourse sc") // ⬅️ 페이징을 위한 count 쿼리 추가
    Page<SavedCourse> findAllPublic(Pageable pageable);

    // ⬇️ 공개 상세 조회 (User 및 모든 경로 정보 포함)
    @Query("SELECT DISTINCT sc FROM SavedCourse sc " +
           "JOIN FETCH sc.user u " + // User 정보 추가
           "LEFT JOIN FETCH sc.days d " +
           // BatchSize를 사용하므로 route는 여기서 fetch하지 않음
           "WHERE sc.id = :courseId")
    Optional<SavedCourse> findDetailsByIdPublic(@Param("courseId") Long courseId);
}