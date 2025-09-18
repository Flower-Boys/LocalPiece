package com.flowerguys.localpiece.domain.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowerguys.localpiece.domain.ai.dto.AiRequestDto;
import com.flowerguys.localpiece.domain.ai.entity.AiJob;
import com.flowerguys.localpiece.domain.ai.repository.AiJobRepository;
import com.flowerguys.localpiece.domain.ai.service.AiRequestService;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiRequestService aiRequestService;
    private final AiJobRepository aiJobRepository;
    private final ObjectMapper objectMapper;

    @PostMapping(value = "/generate-blog", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, UUID>> generateAiBlog(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("request") String requestJson, // 4. 파라미터 이름을 requestJson으로 변경
            @RequestPart("images") List<MultipartFile> images) throws Exception { // 5. 예외 처리 추가

        // 6. String으로 받은 JSON을 DTO 객체로 직접 변환
        AiRequestDto request = objectMapper.readValue(requestJson, AiRequestDto.class);

        String userEmail = userDetails.getUsername();

        // 7. 이제 DTO 객체의 getter 메소드를 안전하게 사용
        UUID jobId = aiRequestService.requestAiBlogGeneration(userEmail, request.getCity(), images, request.isUseV2());

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("jobId", jobId));
    }

    // ✨ 작업 상태를 조회하는 새로운 API
    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<AiJob> getJobStatus(@PathVariable UUID jobId) {
        AiJob job = aiJobRepository.findById(jobId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND)); // 적절한 ErrorCode 필요
        return ResponseEntity.ok(job);
    }
}