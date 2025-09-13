package com.flowerguys.localpiece.domain.ai.service;

import com.flowerguys.localpiece.domain.ai.dto.AiGenerationRequestDto;
import com.flowerguys.localpiece.domain.ai.dto.AiResponseDto;
import com.flowerguys.localpiece.domain.ai.dto.ImageMetadataDto;
import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.blog.entity.BlogImage;
import com.flowerguys.localpiece.domain.blog.repository.BlogRepository;
import com.flowerguys.localpiece.domain.image.service.ImageUploadService;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.domain.user.repository.UserRepository;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final RestTemplate restTemplate;
    private final ImageUploadService imageUploadService;
    private final MetadataService metadataService;
    private final UserRepository userRepository;
    private final BlogRepository blogRepository;

    @Value("${ai-server.url}")
    private String aiServerUrl;
    @Value("${ai-server.token}")
    private String hfToken;

    @Transactional
    public Long generateAiBlog(String userEmail, String city, List<MultipartFile> images) {
        User user = userRepository.findByEmailAndIsDeletedFalse(userEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 1. OCI 업로드 및 메타데이터 추출을 병렬로 처리 (성능 향상)
        List<ImageMetadataDto> imageInfos = images.parallelStream().map(file -> {
            String imageUrl = imageUploadService.uploadImage(file);
            return metadataService.extractMetadata(file, imageUrl);
        }).collect(Collectors.toList());

        // 2. 촬영 시간(timestamp)을 기준으로 이미지 정렬하여 '타임라인' 생성
        imageInfos.sort(Comparator.comparing(ImageMetadataDto::getSafeTimestamp));
        
        // 3. 정렬된 이미지 URL 목록
        List<String> sortedImageUrls = imageInfos.stream()
                                                 .map(ImageMetadataDto::getUrl)
                                                 .collect(Collectors.toList());

        // 4. AI 서버에 보낼 요청 데이터 생성 (향후 AI가 메타데이터를 활용할 것을 대비)
        // 현재 AI 서버는 image_urls만 사용하지만, 미리 전체 데이터를 보내도록 설계
        AiGenerationRequestDto aiRequest = new AiGenerationRequestDto(UUID.randomUUID().toString(), imageInfos, city);
        String requestUrl = aiServerUrl + "/api/blogs";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(hfToken); // ⬅️ Hugging Face 인증 토큰 추가

        HttpEntity<AiGenerationRequestDto> entity = new HttpEntity<>(aiRequest, headers);

        try {
            // 5. AI 서버 호출
            AiResponseDto aiResponse = restTemplate.postForObject(requestUrl, entity, AiResponseDto.class);

            if (aiResponse == null) {
                throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "AI 서버 응답 없음");
            }

            // 6. AI 응답을 하나의 문자열로 조합
            StringBuilder contentBuilder = new StringBuilder();
            aiResponse.getBlog().forEach(content -> contentBuilder.append(content.getText()).append("\n\n"));
            contentBuilder.append(aiResponse.getComment());

            // 7. DB에 블로그 저장
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
            return savedBlog.getId();

        } catch (Exception e) {
            log.error("AI 서버 호출 또는 블로그 생성 중 오류 발생: {}", e.getMessage(), e);
            sortedImageUrls.forEach(imageUploadService::deleteImage); // 실패 시 업로드된 이미지 삭제
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "AI 블로그 생성에 실패했습니다.");
        }
    }
}

