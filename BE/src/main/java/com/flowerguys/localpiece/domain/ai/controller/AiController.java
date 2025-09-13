package com.flowerguys.localpiece.domain.ai.controller;

import com.flowerguys.localpiece.domain.ai.entity.AiJob;
import com.flowerguys.localpiece.domain.ai.repository.AiJobRepository;
import com.flowerguys.localpiece.domain.ai.service.AiLogicService;
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

    @PostMapping(value = "/generate-blog", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, UUID>> generateAiBlog(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("city") String city,
            @RequestPart("images") List<MultipartFile> images) {

        String userEmail = userDetails.getUsername();
        // 이제 서비스는 즉시 jobId를 반환합니다.
        UUID jobId = aiRequestService.requestAiBlogGeneration(userEmail, city, images);

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