package com.flowerguys.localpiece.domain.ai.service;

import com.flowerguys.localpiece.domain.ai.dto.AiRequestDto;
import com.flowerguys.localpiece.domain.ai.dto.AiResponseDto;
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

import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    private final RestTemplate restTemplate;
    private final ImageUploadService imageUploadService;
    private final UserRepository userRepository;
    private final BlogRepository blogRepository;

    @Value("${ai-server.url}")
    private String aiServerUrl;

    @Transactional
    public Long generateAiBlog(String userEmail, String city, List<MultipartFile> images) {
        User user = userRepository.findByEmailAndIsDeletedFalse(userEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        List<String> imageUrls = images.stream()
                .map(imageUploadService::uploadImage)
                .collect(Collectors.toList());

        AiRequestDto aiRequest = new AiRequestDto(1, imageUrls, city); // id는 임시값
        String requestUrl = aiServerUrl + "/api/blogs";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // 비공개 Space 접근을 위한 Hugging Face 토큰 (환경 변수에서 읽어와야 함)
        // headers.setBearerAuth(System.getenv("HF_TOKEN"));

        HttpEntity<AiRequestDto> entity = new HttpEntity<>(aiRequest, headers);

        try {
            AiResponseDto aiResponse = restTemplate.postForObject(requestUrl, entity, AiResponseDto.class);

            if (aiResponse == null) {
                throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "AI 서버 응답 없음");
            }

            // AI 응답을 하나의 문자열로 합치기
            StringBuilder contentBuilder = new StringBuilder();
            for (AiResponseDto.BlogContent content : aiResponse.getBlog()) {
                contentBuilder.append(content.getText()).append("\n\n");
            }
            contentBuilder.append(aiResponse.getComment());

            Blog newBlog = Blog.builder()
                    .user(user)
                    .title(city + "에서의 AI 추천 여행기")
                    .content(contentBuilder.toString())
                    .build();

            List<BlogImage> blogImages = imageUrls.stream()
                .map(url -> BlogImage.builder().blog(newBlog).imageUrl(url).build())
                .collect(Collectors.toList());
            newBlog.setImages(blogImages);

            Blog savedBlog = blogRepository.save(newBlog);
            return savedBlog.getId();

        } catch (Exception e) {
            log.error("AI 서버 호출 오류: {}", e.getMessage());
            imageUrls.forEach(imageUploadService::deleteImage); // 실패 시 업로드된 이미지 삭제
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "AI 블로그 생성 실패");
        }
    }
}