package com.flowerguys.localpiece.domain.ai.service;

import com.flowerguys.localpiece.domain.ai.dto.*;
import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.blog.entity.BlogImage;
import com.flowerguys.localpiece.domain.blog.repository.BlogRepository;
import com.flowerguys.localpiece.domain.image.service.ImageUploadService;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component // @Service 대신 @Component를 사용하여 '독립적인 로직 컴포넌트'임을 명시
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

        // 1. OCI 업로드 및 메타데이터 추출 (병렬 처리)
        List<ImageMetadataDto> imageInfos = images.parallelStream().map(file -> {
            String imageUrl = imageUploadService.uploadImage(file);
            return metadataService.extractMetadata(file, imageUrl);
        }).collect(Collectors.toList());

        // 2. 촬영 시간을 기준으로 이미지 정렬 (타임라인 생성)
        imageInfos.sort(Comparator.comparing(ImageMetadataDto::getSafeTimestamp));
        List<String> sortedImageUrls = imageInfos.stream().map(ImageMetadataDto::getUrl).collect(Collectors.toList());

        // 3. AI 서버에 보낼 요청 준비
        AiGenerationRequestDto aiRequest = new AiGenerationRequestDto(UUID.randomUUID().toString(), imageInfos, city);
        String requestUrl = aiServerUrl + "/api/blogs";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(hfToken);
        HttpEntity<AiGenerationRequestDto> entity = new HttpEntity<>(aiRequest, headers);

        // 4. AI 서버 호출 및 블로그 생성
        try {
            AiResponseDto aiResponse = restTemplate.postForObject(requestUrl, entity, AiResponseDto.class);

            if (aiResponse == null) {
                throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "AI 서버 응답 없음");
            }

            StringBuilder contentBuilder = new StringBuilder();
            aiResponse.getBlog().forEach(content -> contentBuilder.append(content.getText()).append("\n\n"));
            contentBuilder.append(aiResponse.getComment());

            Blog newBlog = Blog.builder()
                    .user(user)
                    .title(city + "에서의 AI 추천 여행기")
                    .content(contentBuilder.toString())
                    .build();

            List<BlogImage> blogImages = sortedImageUrls.stream()
                .map(url -> BlogImage.builder().blog(newBlog).imageUrl(url).build())
                .collect(Collectors.toList());
            newBlog.setImages(blogImages);

            Blog savedBlog = blogRepository.save(newBlog);
            log.info("AI 블로그 생성 완료. 블로그 ID: {}", savedBlog.getId());
            return savedBlog.getId();

        } catch (Exception e) {
            log.error("AI 파이프라인 실행 중 오류 발생: {}", e.getMessage(), e);
            // 💡 중요: 실패 시 OCI에 업로드했던 이미지들을 삭제하여 뒷정리합니다.
            sortedImageUrls.forEach(imageUploadService::deleteImage);
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "AI 블로그 생성에 실패했습니다: " + e.getMessage());
        }
    }
}