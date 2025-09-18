package com.flowerguys.localpiece;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.flowerguys.localpiece.domain.blog.service.BlogService;

@EnableJpaAuditing
@SpringBootApplication
@EnableJpaRepositories("com.flowerguys.localpiece.domain") // ⬅️ 리포지토리 경로 추가
@EntityScan("com.flowerguys.localpiece.domain")    
public class LocalpieceApplication {

	public static void main(String[] args) {
		SpringApplication.run(LocalpieceApplication.class, args);
	}

	@Bean
    public CommandLineRunner run(BlogService blogService) {
        return args -> {
            blogService.backfillThumbnails();
        };
    }
}
