package com.flowerguys.localpiece.domain.ai.service;

import com.flowerguys.localpiece.domain.ai.entity.AiJob;
import com.flowerguys.localpiece.domain.ai.repository.AiJobRepository;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.domain.user.repository.UserRepository;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import com.flowerguys.localpiece.domain.ai.dto.SimpleMultipartFile;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiRequestService {

    private final UserRepository userRepository;
    private final AiJobRepository aiJobRepository;
    private final AiTaskService aiTaskService;

    @Transactional
    public UUID requestAiBlogGeneration(String userEmail, String city, List<MultipartFile> images, boolean useV2) {
        User user = userRepository.findByEmailAndIsDeletedFalse(userEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        List<SimpleMultipartFile> copiedFiles = new ArrayList<>();
        if (images != null) {
            for (MultipartFile file : images) {
                try {
                    copiedFiles.add(new SimpleMultipartFile(file.getOriginalFilename(), file.getContentType(), file.getBytes()));
                } catch (IOException e) {
                    throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "파일을 읽는 중 오류가 발생했습니다.");
                }
            }
        }

        // 1. '작업'을 생성하고 DB에 저장하여 '접수증' 발급
        AiJob newJob = AiJob.builder().build();
        aiJobRepository.save(newJob);

        // 2. '특별 요리사'에게 백그라운드 작업을 던지는 로직을 'afterCommit'으로 변경
        // 이 로직은 현재 트랜잭션이 성공적으로 커밋된 후에만 실행됩니다.
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                aiTaskService.processAiBlogGeneration(newJob.getJobId(), user, city, copiedFiles, useV2);
            }
        });

        // 3. 사용자에게는 '접수증 ID'만 즉시 반환
        return newJob.getJobId();
    }
}