package com.flowerguys.localpiece.domain.course.service;

import com.flowerguys.localpiece.domain.course.dto.CourseRequestDto;
import com.flowerguys.localpiece.domain.course.dto.CourseResponseDto;
import com.flowerguys.localpiece.domain.course.dto.ReplacePlaceRequestDto;
import com.flowerguys.localpiece.domain.course.dto.CourseOptionDto;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseService {

    private final RestTemplate restTemplate;

    @Value("${ai-new-server.url}")
    private String aiNewServerUrl;

    public CourseResponseDto generateCourse(CourseRequestDto requestDto) {
        String url = aiNewServerUrl + "/api/courses/generate";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<CourseRequestDto> entity = new HttpEntity<>(requestDto, headers);

        try {
            ResponseEntity<CourseResponseDto> response = restTemplate.exchange(url, HttpMethod.POST, entity, CourseResponseDto.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("AI 코스 생성 요청 실패: {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "AI 코스 생성에 실패했습니다.");
        }
    }

    public CourseOptionDto replacePlace(ReplacePlaceRequestDto requestDto) {
        String url = aiNewServerUrl + "/api/courses/replace-place";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<ReplacePlaceRequestDto> entity = new HttpEntity<>(requestDto, headers);

        try {
            ResponseEntity<CourseOptionDto> response = restTemplate.exchange(url, HttpMethod.POST, entity, CourseOptionDto.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("AI 장소 교체 요청 실패: {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "AI 장소 교체에 실패했습니다.");
        }
    }
}