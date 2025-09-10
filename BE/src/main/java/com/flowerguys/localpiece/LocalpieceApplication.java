package com.flowerguys.localpiece;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class LocalpieceApplication {

	public static void main(String[] args) {
		SpringApplication.run(LocalpieceApplication.class, args);
	}

}
