package com.flowerguys.localpiece.domain.blog.service;

import com.flowerguys.localpiece.domain.blog.dto.BlogCreateRequest;
import com.flowerguys.localpiece.domain.blog.dto.BlogResponse;
import com.flowerguys.localpiece.domain.blog.dto.BlogUpdateRequest;
import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.blog.entity.BlogImage;
import com.flowerguys.localpiece.domain.blog.repository.BlogImageRepository;
import com.flowerguys.localpiece.domain.blog.repository.BlogRepository;
import com.flowerguys.localpiece.domain.image.service.ImageUploadService;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.domain.user.repository.UserRepository;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UserDetails;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;
    private final ImageUploadService imageUploadService;
    private final BlogImageRepository blogImageRepository;

    // 블로그 작성 로직
    @Transactional
    public BlogResponse createBlog(String userEmail, BlogCreateRequest request, List<MultipartFile> images) {
        // 1. 사용자 정보 찾기
        User user = userRepository.findByEmailAndIsDeletedFalse(userEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 2. DTO와 사용자 정보를 바탕으로 Blog 엔티티 생성
        Blog blog = Blog.builder()
                .user(user)
                .title(request.getTitle())
                .content(request.getContent())
                .isPrivate(request.isPrivate())
                .build();

        // 3. 이미지 파일들을 Object Storage에 업로드하고, URL들을 DB에 저장
          if (images != null && !images.isEmpty()) {
            images.forEach(imageFile -> {
                String imageUrl = imageUploadService.uploadImage(imageFile); // 여기서 실패 시 BusinessException 발생
                BlogImage blogImage = BlogImage.builder()
                        .blog(blog)
                        .imageUrl(imageUrl)
                        .build();
                blog.getImages().add(blogImage);
            });
        }

        Blog savedBlog = blogRepository.saveAndFlush(blog);

        return new BlogResponse(savedBlog);
    }
    
    // 블로그 목록 조회 로직
    @Transactional(readOnly = true) // 읽기 전용 트랜잭션으로 성능 최적화
    public List<BlogResponse> getBlogList() {
        // ⬇️ isDeleted = false 이고 isPrivate = false 인 글만 찾도록 변경
        return blogRepository.findAllByIsDeletedFalseAndIsPrivateFalseOrderByCreatedAtDesc()
                .stream()
                .map(BlogResponse::new)
                .collect(Collectors.toList());
    }

    // 블로그 상세 조회 로직 (readonly는 나중에 성능 최적화 시 변경 검토)
    @Transactional
    public BlogResponse getBlogAndIncreaseViewCount(Long blogId, UserDetails userDetails) {
        // 1. 블로그 존재 여부 확인
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BLOG_NOT_FOUND));

        // 2. 삭제 여부 확인
        if (blog.isDeleted()) {
            throw new BusinessException(ErrorCode.BLOG_NOT_FOUND);
        }

        // 3. 비공개 글 권한 확인 (null-safe)
        if (blog.isPrivate()) {
            String loggedInUserEmail = (userDetails != null) ? userDetails.getUsername() : "";
            String blogAuthorEmail = blog.getUser().getEmail();
            if (!loggedInUserEmail.equals(blogAuthorEmail)) {
                throw new BusinessException(ErrorCode.ACCESS_DENIED);
            }
        }

        // 4. 모든 검증을 통과한 후에만 조회수를 증가시킴
        blogRepository.updateViewCount(blogId);

        // 5. DTO로 변환하여 반환
        return new BlogResponse(blog);
    }

    // 블로그 수정 로직
    @Transactional
    public BlogResponse updateBlog(Long blogId, String userEmail, BlogUpdateRequest request, List<MultipartFile> newImages) {
        // 1. 블로그 존재 여부 확인
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BLOG_NOT_FOUND));

        // 2. 삭제된 글인지 확인
        if (blog.isDeleted()) {
            throw new BusinessException(ErrorCode.BLOG_NOT_FOUND); // 삭제된 글은 없는 글처럼 취급
        }

        // 3. 사용자 존재 여부 및 글 작성자 권한 확인
        User user = userRepository.findByEmailAndIsDeletedFalse(userEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (!blog.getUser().equals(user)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        // 4. 삭제할 이미지가 있으면 삭제 처리
        if (request.getIdsToDelete() != null && !request.getIdsToDelete().isEmpty()) {
        // 4-1. (보안) 삭제 요청된 이미지들이 정말 이 블로그 소속인지 확인
        List<BlogImage> imagesToDelete = blogImageRepository.findAllByBlogAndIdIn(blog, request.getIdsToDelete());

        // 4-2. OCI Object Storage에서 실제 파일을 삭제하기 위해 URL 목록을 미리 확보
        List<String> urlsToDeleteFromOCI = imagesToDelete.stream()
                                                         .map(BlogImage::getImageUrl)
                                                         .collect(Collectors.toList());

        // 4-3. DB에서 BlogImage 엔티티 삭제
        blogImageRepository.deleteAllInBatch(imagesToDelete);

        // 4-4. OCI Object Storage에서 실제 파일 삭제
        urlsToDeleteFromOCI.forEach(imageUploadService::deleteImage);
    }
        
        // 5. 새로운 이미지가 있으면 업로드 처리
        if (newImages != null && !newImages.isEmpty()) {
            newImages.forEach(imageFile -> {
                String imageUrl = imageUploadService.uploadImage(imageFile);
                BlogImage blogImage = BlogImage.builder()
                        .blog(blog)
                        .imageUrl(imageUrl)
                        .build();
                blog.getImages().add(blogImage);
            });
        }

        // 6. (Setter 대신) 엔티티 내부의 업데이트 메소드를 호출하여 수정 (더 객체지향적인 방식)
        blog.update(request.getTitle(), request.getContent(), request.getIsPrivate());
        
        return new BlogResponse(blog);
    }

    // 블로그 삭제 로직
    @Transactional
    public void deleteBlog(Long blogId, String userEmail) {
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BLOG_NOT_FOUND));

        User user = userRepository.findByEmailAndIsDeletedFalse(userEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 글 작성자인지 권한 확인
        if (!blog.getUser().equals(user)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        blog.delete();
    }
}