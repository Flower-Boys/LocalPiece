package com.flowerguys.localpiece.domain.ai.service;

import com.flowerguys.localpiece.domain.ai.entity.AiJob;
import com.flowerguys.localpiece.domain.ai.repository.AiJobRepository;
import com.flowerguys.localpiece.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;
import com.flowerguys.localpiece.domain.ai.dto.SimpleMultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiTaskService {

    private final AiLogicService aiLogicService;
    private final AiJobRepository aiJobRepository;

    @Async // 이 메소드는 별도의 스레드에서 비동기적으로 실행됩니다.
    @Transactional // 이 메소드 역시 자체적인 트랜잭션을 가집니다.
    public void processAiBlogGeneration(UUID jobId, User user, String city, List<SimpleMultipartFile> images, boolean useV2) {
        // 💡 중요: @Async 메소드는 public이어야 합니다.
        log.info("비동기 AI 작업 시작. Job ID: {}", jobId);
        
        // 1. DB에서 작업 정보를 다시 조회합니다.
        AiJob job = aiJobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalStateException("AI Job을 찾을 수 없습니다: " + jobId));

        // 2. 상태를 '처리 중'으로 업데이트합니다.
        job.markAsProcessing();
        aiJobRepository.save(job);

        try {
            // 3. 실제 '일꾼'에게 무거운 작업을 시킵니다.
            Long blogId = aiLogicService.executeAiPipeline(user, city, images, useV2);

            // 4. 성공 결과를 DB에 기록합니다.
            job.markAsCompleted(blogId);
            aiJobRepository.save(job);
            log.info("비동기 AI 작업 성공. Job ID: {}", jobId);

        } catch (Exception e) {
            // 5. 실패 결과를 DB에 기록합니다.
            log.error("비동기 AI 작업 실패. Job ID: {}. 원인: {}", jobId, e.getMessage());
            job.markAsFailed(e.getMessage());
            aiJobRepository.save(job);
        }
    }
}