package com.flowerguys.localpiece.domain.ai.entity;

import com.flowerguys.localpiece.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA를 위한 파라미터 없는 보호된 생성자
public class AiJob extends BaseTimeEntity {

    @Id
    @Column(columnDefinition = "BINARY(16)")
    private UUID jobId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status;

    private Long resultBlogId;

    @Column(length = 1000)
    private String errorMessage;

    // 빌더 패턴을 사용하여 객체를 생성하기 위한 생성자
    @Builder
    public AiJob(UUID jobId, JobStatus status, Long resultBlogId, String errorMessage) {
        this.jobId = (jobId == null) ? UUID.randomUUID() : jobId;
        this.status = (status == null) ? JobStatus.PENDING : status;
        this.resultBlogId = resultBlogId;
        this.errorMessage = errorMessage;
    }

    //== 상태 업데이트 편의 메소드 ==//
    public void markAsProcessing() {
        this.status = JobStatus.PROCESSING;
    }

    public void markAsCompleted(Long blogId) {
        this.status = JobStatus.COMPLETED;
        this.resultBlogId = blogId;
    }

    public void markAsFailed(String message) {
        this.status = JobStatus.FAILED;
        this.errorMessage = (message != null && message.length() > 1000) ? message.substring(0, 1000) : message;
    }
}