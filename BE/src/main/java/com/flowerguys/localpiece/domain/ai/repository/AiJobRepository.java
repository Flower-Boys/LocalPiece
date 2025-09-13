package com.flowerguys.localpiece.domain.ai.repository;

import com.flowerguys.localpiece.domain.ai.entity.AiJob;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AiJobRepository extends JpaRepository<AiJob, UUID> {
}