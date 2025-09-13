package com.flowerguys.localpiece.domain.ai.service;

import com.flowerguys.localpiece.domain.ai.dto.*;
import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.blog.entity.BlogContent;
import com.flowerguys.localpiece.domain.blog.entity.ContentType;
import com.flowerguys.localpiece.domain.blog.repository.BlogRepository;
import com.flowerguys.localpiece.domain.image.service.ImageUploadService;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiLogicService {

    private final RestTemplate restTemplate;
    private final ImageUploadService imageUploadService;
    private final MetadataService metadataService;
    private final BlogRepository blogRepository;

    @Value("${ai-server.url}")
    private String aiServerUrl;
    @Value("${ai-server.token}")
    private String hfToken;

    @Transactional
    public Long executeAiPipeline(User user, String city, List<MultipartFile> images) {
        log.info("AI 파이프라인 시작. 사용자: {}", user.getEmail());

        List<ImageMetadataDto> imageInfos = images.parallelStream().map(file -> {
            String imageUrl = imageUploadService.uploadImage(file);
            return metadataService.extractMetadata(file, imageUrl);
        }).collect(Collectors.toList());

        imageInfos.sort(Comparator.comparing(ImageMetadataDto::getSafeTimestamp));
        List<String> sortedImageUrls = imageInfos.stream().map(ImageMetadataDto::getUrl).collect(Collectors.toList());

        AiGenerationRequestDto aiRequest = new AiGenerationRequestDto(UUID.randomUUID().toString(), imageInfos, city);
        String requestUrl = aiServerUrl + "/api/blogs";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(hfToken);
        HttpEntity<AiGenerationRequestDto> entity = new HttpEntity<>(aiRequest, headers);

        try {
            ResponseEntity<AiResponseDto> response = restTemplate.exchange(requestUrl, HttpMethod.POST, entity, AiResponseDto.class);
            AiResponseDto aiResponse = response.getBody();

            if (aiResponse == null) throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "AI 서버 응답 없음");

            // AI 응답을 새로운 '블록' 구조로 변환
            List<BlogContent> blogContents = new ArrayList<>();
            int sequence = 1;
            for (AiResponseDto.BlogContent contentBlock : aiResponse.getBlog()) {
                blogContents.add(BlogContent.builder()
                        .contentType(ContentType.IMAGE)
                        .sequence(sequence++)
                        .content(contentBlock.getImage())
                        .build());
                blogContents.add(BlogContent.builder()
                        .contentType(ContentType.TEXT)
                        .sequence(sequence++)
                        .content(contentBlock.getText())
                        .build());
            }
            // 최종 코멘트도 텍스트 블록으로 추가
            blogContents.add(BlogContent.builder()
                    .contentType(ContentType.TEXT)
                    .sequence(sequence)
                    .content(aiResponse.getComment())
                    .build());

            Blog newBlog = Blog.builder()
                    .user(user)
                    .title(city + "에서의 AI 추천 여행기")
                    .isPrivate(false)
                    .build();
            
            // Blog 엔티티에 생성된 contents 목록을 연결
            newBlog.setContents(blogContents.stream().peek(bc -> bc.setBlog(newBlog)).collect(Collectors.toList()));

            Blog savedBlog = blogRepository.save(newBlog);
            log.info("AI 블로그 생성 완료. 블로그 ID: {}", savedBlog.getId());
            return savedBlog.getId();

        } catch (Exception e) {
            log.error("AI 파이프라인 실행 중 오류: {}", e.getMessage(), e);
            sortedImageUrls.forEach(imageUploadService::deleteImage);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "AI 블로그 생성 실패: " + e.getMessage());
        }
    }
}