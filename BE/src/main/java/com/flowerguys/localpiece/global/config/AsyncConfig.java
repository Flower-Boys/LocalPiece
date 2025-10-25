package com.flowerguys.localpiece.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync // Spring의 비동기(@Async) 메소드 기능을 활성화합니다.
public class AsyncConfig {
}