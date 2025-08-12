package com.flowerguys.localpiece.blog.service;

import com.flowerguys.localpiece.blog.dto.BlogCreateRequest;
import com.flowerguys.localpiece.blog.dto.BlogResponse;
import com.flowerguys.localpiece.blog.entity.Blog;
import com.flowerguys.localpiece.blog.repository.BlogRepository;
import com.flowerguys.localpiece.user.entity.User;
import com.flowerguys.localpiece.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

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
}