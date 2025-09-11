package com.flowerguys.localpiece.global.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.flowerguys.localpiece.global.config.jwt.JwtAuthenticationFilter;

import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.AuthenticationEntryPoint;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**",
                                "/actuator/health",
                                "/actuator/health/liveness",
                                "/actuator/health/readiness"
                                ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/blogs", "/api/blogs/**").permitAll()
                        .requestMatchers("/api/users/login", "/api/users/signup").permitAll()
                        .requestMatchers("/api/tour/**").permitAll() 
                        .anyRequest().authenticated()
                )
                .formLogin(login -> login.disable())

                // 예외 처리 커스터마이징 추가
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new AuthenticationEntryPoint() {
                            @Override
                            public void commence(jakarta.servlet.http.HttpServletRequest request,
                                                 jakarta.servlet.http.HttpServletResponse response,
                                                 org.springframework.security.core.AuthenticationException authException)
                                    throws java.io.IOException, jakarta.servlet.ServletException {
                                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
                                response.setContentType("application/json;charset=UTF-8");
                                response.getWriter().write("{\"error\":\"이메일이 올바르지 않거나 탈퇴한 유저입니다.\"}");
                            }
                        })
                        .accessDeniedHandler(new AccessDeniedHandler() {
                            @Override
                            public void handle(jakarta.servlet.http.HttpServletRequest request,
                                               jakarta.servlet.http.HttpServletResponse response,
                                               org.springframework.security.access.AccessDeniedException accessDeniedException)
                                    throws java.io.IOException, jakarta.servlet.ServletException {
                                response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
                                response.setContentType("application/json;charset=UTF-8");
                                response.getWriter().write("{\"error\":\"접근 권한이 없습니다.\"}");
                            }
                        })
                );


        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS 정책 설정 빈 등록
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용할 출처 주소 (프론트엔드 주소)
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000", // 로컬 React 개발 서버
                "http://localhost:5173", // 로컬 Vite 개발 서버 (필요 시 추가)
                "http://localpiece.duckdns.org",     // Duck DNS 도메인 (HTTP)
                "https://localpiece.duckdns.org"   // Duck DNS 도메인 (HTTPS)
        )); 

        configuration.setAllowedMethods(List.of("GET", "POST", "PATCH","PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // 쿠키, 인증 헤더 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public org.springframework.web.client.RestTemplate restTemplate() {
        return new org.springframework.web.client.RestTemplate();
    }
}
