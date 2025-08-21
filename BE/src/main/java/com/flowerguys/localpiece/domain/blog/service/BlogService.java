package com.flowerguys.localpiece.domain.blog.service;

import com.flowerguys.localpiece.domain.blog.dto.BlogCreateRequest;
import com.flowerguys.localpiece.domain.blog.dto.BlogResponse;
import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.blog.repository.BlogRepository;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

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
        return blogRepository.findAll() // DB에서 모든 Blog를 찾아옴
                .stream() // 리스트를 스트림으로 변환
                .map(BlogResponse::new) // 각 Blog 객체를 BlogResponse DTO로 변환
                .collect(Collectors.toList()); // 다시 리스트로 만듦
    }
}