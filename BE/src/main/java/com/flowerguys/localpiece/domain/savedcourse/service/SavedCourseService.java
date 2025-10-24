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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedCourseService {

    private final UserRepository userRepository;
    private final SavedCourseRepository savedCourseRepository;

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
        return savedCourseRepository.findDetailsByIdAndUserEmail(courseId, email)
                .map(SavedCourseDetailResponseDto::new) // 조회된 Entity를 DTO로 변환
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCESS_DENIED, "해당 코스를 조회할 권한이 없거나 코스가 존재하지 않습니다."));
    }

    @Transactional
    public void deleteSavedCourse(Long courseId, String email) {
        SavedCourse course = savedCourseRepository.findByIdAndUserEmail(courseId, email)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCESS_DENIED, "해당 코스를 삭제할 권한이 없습니다."));
        savedCourseRepository.delete(course);
    }
}