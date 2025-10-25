package com.flowerguys.localpiece.domain.savedcourse.service;

import com.flowerguys.localpiece.domain.course.dto.DailyCourseDto;
import com.flowerguys.localpiece.domain.course.dto.PlaceDto;
import com.flowerguys.localpiece.domain.savedcourse.dto.CourseSaveRequestDto;
import com.flowerguys.localpiece.domain.savedcourse.dto.SavedCourseDetailResponseDto;
import com.flowerguys.localpiece.domain.savedcourse.dto.SavedCourseListResponseDto;
import com.flowerguys.localpiece.domain.savedcourse.entity.SavedCourse;
import com.flowerguys.localpiece.domain.savedcourse.entity.SavedDay;
import com.flowerguys.localpiece.domain.savedcourse.entity.SavedPlace;
import com.flowerguys.localpiece.domain.savedcourse.repository.SavedCourseRepository;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.domain.user.repository.UserRepository;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import com.flowerguys.localpiece.global.util.SqliteUtil;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page; 
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class SavedCourseService {

    private final UserRepository userRepository;
    private final SavedCourseRepository savedCourseRepository;
    private final SqliteUtil sqliteUtil;

    private User findUser(String email) {
        return userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    @Transactional
    public Long saveCourse(String email, CourseSaveRequestDto requestDto) {
        User user = findUser(email);

        SavedCourse course = SavedCourse.builder()
                .user(user)
                .tripTitle(requestDto.getTripTitle())
                .themeTitle(requestDto.getCourseOption().getThemeTitle())
                .build();

        for (DailyCourseDto dayDto : requestDto.getCourseOption().getDays()) {
            SavedDay day = SavedDay.builder().day(dayDto.getDay()).date(dayDto.getDate()).build();
            for (PlaceDto placeDto : dayDto.getRoute()) {
                SavedPlace place = SavedPlace.builder()
                        .orderNum(placeDto.getOrder())
                        .contentId(placeDto.getContentId())
                        .type(placeDto.getType())
                        .name(placeDto.getName())
                        .category(placeDto.getCategory())
                        .address(placeDto.getAddress())
                        .arrivalTime(placeDto.getArrivalTime())
                        .departureTime(placeDto.getDepartureTime())
                        .durationMinutes(placeDto.getDurationMinutes())
                        .build();
                day.addPlace(place);
            }
            course.addDay(day);
        }
        return savedCourseRepository.save(course).getId();
    }
    
    @Transactional(readOnly = true)
    public List<SavedCourseListResponseDto> getSavedCourses(String email) {
        return savedCourseRepository.findAllByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(SavedCourseListResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SavedCourseDetailResponseDto getSavedCourseDetails(Long courseId, String email) {
        SavedCourse savedCourse = savedCourseRepository.findDetailsByIdAndUserEmail(courseId, email)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCESS_DENIED, "해당 코스를 조회할 권한이 없거나 코스가 존재하지 않습니다."));

        // 코스 내 모든 장소의 contentId 목록 추출
        Set<Integer> contentIds = savedCourse.getDays().stream()
                .flatMap(day -> day.getRoute().stream())
                .map(SavedPlace::getContentId) // SavedPlace의 contentId 필드 타입에 맞게 (Integer 가정)
                .collect(Collectors.toSet());

        // SqliteUtil을 사용하여 contentTypeId 조회
        Map<Integer, String> contentTypeMap = sqliteUtil.findContentTypeIds(contentIds);

        // Entity -> DTO 변환 및 contentTypeId 설정
        SavedCourseDetailResponseDto responseDto = new SavedCourseDetailResponseDto(savedCourse);
        responseDto.getDays().forEach(dayDto -> {
            dayDto.getRoute().forEach(placeDto -> {
                String contentTypeId = contentTypeMap.get(placeDto.getContentId());
                if (contentTypeId != null) {
                    placeDto.setContentTypeId(contentTypeId); // Setter를 이용해 값 설정
                } else {
                    // DB에 해당 contentId가 없거나 top_parent_code가 null인 경우
                    log.warn("Content Type ID not found in SQLite for contentId: {}", placeDto.getContentId());
                    placeDto.setContentTypeId(null); // 또는 기본값 설정
                }
            });
        });

        return responseDto;
    }

    @Transactional
    public void deleteSavedCourse(Long courseId, String email) {
        SavedCourse course = savedCourseRepository.findByIdAndUserEmail(courseId, email)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCESS_DENIED, "해당 코스를 삭제할 권한이 없습니다."));
        savedCourseRepository.delete(course);
    }

    // ⬇️ 공개 저장 코스 목록 조회 (페이징)
    @Transactional(readOnly = true)
    public Page<SavedCourseListResponseDto> getPublicSavedCourses(Pageable pageable) {
        // Repository에서 User 정보와 함께 조회 후 DTO로 변환
        return savedCourseRepository.findAllPublic(pageable)
                .map(SavedCourseListResponseDto::new); // Page 객체의 map 활용
    }

    // ⬇️ 공개 저장 코스 상세 조회
    @Transactional(readOnly = true)
    public SavedCourseDetailResponseDto getPublicSavedCourseDetails(Long courseId) {
        // Repository에서 User 정보와 함께 조회
        SavedCourse savedCourse = savedCourseRepository.findDetailsByIdPublic(courseId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "해당 ID의 저장된 코스를 찾을 수 없습니다."));

        // SQLite 조회 로직은 기존 getSavedCourseDetails와 동일하게 적용
        Set<Integer> contentIds = savedCourse.getDays().stream()
                .flatMap(day -> day.getRoute().stream())
                .map(SavedPlace::getContentId)
                .collect(Collectors.toSet());

        Map<Integer, String> contentTypeMap = sqliteUtil.findContentTypeIds(contentIds);

        SavedCourseDetailResponseDto responseDto = new SavedCourseDetailResponseDto(savedCourse);
        responseDto.getDays().forEach(dayDto -> {
            dayDto.getRoute().forEach(placeDto -> {
                String contentTypeId = contentTypeMap.get(placeDto.getContentId());
                placeDto.setContentTypeId(contentTypeId);
            });
        });

        return responseDto;
    }
}