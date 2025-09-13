package com.flowerguys.localpiece.domain.blog.service;

import com.flowerguys.localpiece.domain.blog.dto.*;
import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.blog.entity.BlogContent;
import com.flowerguys.localpiece.domain.blog.entity.ContentType;
import com.flowerguys.localpiece.domain.blog.repository.BlogContentRepository;
import com.flowerguys.localpiece.domain.blog.repository.BlogRepository;
import com.flowerguys.localpiece.domain.image.service.ImageUploadService;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.domain.user.repository.UserRepository;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;
    private final BlogContentRepository blogContentRepository;
    private final ImageUploadService imageUploadService;

    @Transactional
    public BlogResponse createBlog(String userEmail, BlogCreateRequest request, List<MultipartFile> imageFiles) {
        User user = findUser(userEmail);

        Blog blog = Blog.builder()
                .user(user)
                .title(request.getTitle())
                .isPrivate(request.isPrivate())
                .build();
        
        List<BlogContent> contents = processBlogContents(blog, request.getContents(), imageFiles);
        blog.setContents(contents);

        Blog savedBlog = blogRepository.save(blog);
        return new BlogResponse(savedBlog);
    }

    @Transactional(readOnly = true)
    public List<BlogResponse> getBlogList() {
        return blogRepository.findAllByIsDeletedFalseAndIsPrivateFalseOrderByCreatedAtDesc()
                .stream()
                .map(BlogResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public BlogResponse getBlogAndIncreaseViewCount(Long blogId, UserDetails userDetails) {
        Blog blog = findBlogWithContents(blogId);
        checkBlogAccess(blog, userDetails);
        blogRepository.updateViewCount(blogId);
        return new BlogResponse(blog);
    }

    @Transactional
    public BlogResponse updateBlog(Long blogId, String userEmail, BlogUpdateRequest request, List<MultipartFile> imageFiles) {
        User user = findUser(userEmail);
        Blog blog = findBlogWithContents(blogId);
        checkOwnership(blog, user);

        blog.update(request.getTitle(), request.getIsPrivate());

        List<String> newImageUrls = request.getContents().stream()
                .filter(c -> c.getContentType() == ContentType.IMAGE && c.getContent().startsWith("http"))
                .map(BlogContentDto::getContent)
                .collect(Collectors.toList());

        blog.getContents().stream()
                .filter(c -> c.getContentType() == ContentType.IMAGE)
                .map(BlogContent::getContent)
                .filter(oldUrl -> !newImageUrls.contains(oldUrl))
                .forEach(imageUploadService::deleteImage);

        // 1. 기존 contents 컬렉션을 비웁니다. (orphanRemoval=true에 의해 DB에서도 삭제됨)
        blog.getContents().clear();

        // 2. 새로운 BlogContent 리스트를 만듭니다. (이때 blog와의 연관관계가 설정됩니다)
        List<BlogContent> newContents = processBlogContents(blog, request.getContents(), imageFiles);

        // 3. 비워진 기존 컬렉션에 새로운 내용들을 모두 추가합니다.
        blog.getContents().addAll(newContents);
        
        return new BlogResponse(blog);
    }

    @Transactional
    public void deleteBlog(Long blogId, String userEmail) {
        User user = findUser(userEmail);
        Blog blog = findBlogWithContents(blogId);
        checkOwnership(blog, user);

        blog.getContents().stream()
                .filter(c -> c.getContentType() == ContentType.IMAGE)
                .map(BlogContent::getContent)
                .forEach(imageUploadService::deleteImage);

        blog.delete();
    }
    
    // --- Private Helper Methods ---

    private List<BlogContent> processBlogContents(Blog blog, List<BlogContentDto> contentDtos, List<MultipartFile> imageFiles) {
        Map<String, MultipartFile> imageMap = (imageFiles != null) ? imageFiles.stream()
                .collect(Collectors.toMap(MultipartFile::getOriginalFilename, file -> file)) : Map.of();
        
        return contentDtos.stream().map(dto -> {
            String contentValue;
            if (dto.getContentType() == ContentType.IMAGE) {
                if (dto.getContent().startsWith("http")) {
                    contentValue = dto.getContent();
                } else {
                    MultipartFile imageFile = imageMap.get(dto.getContent());
                    if (imageFile == null) {
                        throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "요청된 이미지 파일을 찾을 수 없습니다: " + dto.getContent());
                    }
                    contentValue = imageUploadService.uploadImage(imageFile);
                }
            } else {
                contentValue = dto.getContent();
            }
            return BlogContent.builder()
                    .blog(blog)
                    .sequence(dto.getSequence())
                    .contentType(dto.getContentType())
                    .content(contentValue)
                    .build();
        }).collect(Collectors.toList());
    }

    private User findUser(String email) {
        return userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private Blog findBlogWithContents(Long blogId) {
        return blogRepository.findWithContentsById(blogId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BLOG_NOT_FOUND));
    }

    private void checkOwnership(Blog blog, User user) {
        if (!blog.getUser().equals(user)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
    }

    private void checkBlogAccess(Blog blog, UserDetails userDetails) {
        if (blog.isDeleted()) {
            throw new BusinessException(ErrorCode.BLOG_NOT_FOUND);
        }
        if (blog.isPrivate()) {
            String loggedInUserEmail = (userDetails != null) ? userDetails.getUsername() : "";
            if (!blog.getUser().getEmail().equals(loggedInUserEmail)) {
                throw new BusinessException(ErrorCode.ACCESS_DENIED);
            }
        }
    }
}