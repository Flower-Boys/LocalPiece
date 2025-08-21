package com.flowerguys.localpiece.domain.blog.service;

import com.flowerguys.localpiece.domain.blog.dto.BlogCreateRequest;
import com.flowerguys.localpiece.domain.blog.dto.BlogResponse;
import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.blog.repository.BlogRepository;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.domain.user.repository.UserRepository;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    // 블로그 작성 로직
    @Transactional
    public BlogResponse createBlog(String userEmail, BlogCreateRequest request) {
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
       
        Blog savedBlog = blogRepository.save(blog);

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
}