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
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiRequestService {

    private final UserRepository userRepository;
    private final AiJobRepository aiJobRepository;
    private final AiTaskService aiTaskService;

    @Transactional
    public UUID requestAiBlogGeneration(String userEmail, String city, List<MultipartFile> images) {
        User user = userRepository.findByEmailAndIsDeletedFalse(userEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 1. '작업'을 생성하고 DB에 저장하여 '접수증' 발급
        AiJob newJob = AiJob.builder().build();
        aiJobRepository.save(newJob);

        // 2. '특별 요리사'에게 백그라운드 작업을 던져버림 (이 호출은 즉시 리턴됨)
        aiTaskService.processAiBlogGeneration(newJob.getJobId(), user, city, images);

        // 3. 사용자에게는 '접수증 ID'만 즉시 반환
        return newJob.getJobId();
    }
}