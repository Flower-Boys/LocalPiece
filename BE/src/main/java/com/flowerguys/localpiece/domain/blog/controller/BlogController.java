package com.flowerguys.localpiece.domain.blog.controller;

import lombok.RequiredArgsConstructor;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.flowerguys.localpiece.domain.blog.dto.BlogCreateRequest;
import com.flowerguys.localpiece.domain.blog.dto.BlogResponse;
import com.flowerguys.localpiece.domain.blog.service.BlogService;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    // 블로그 생성 API
    @PostMapping
    public ResponseEntity<BlogResponse> createBlog(
            @RequestBody BlogCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        // 현재 로그인한 사용자의 이메일(username) 가져오기
        String email = userDetails.getUsername();
        BlogResponse blogResponse = blogService.createBlog(email, request);

        // ⬇️ Location 헤더와 함께, 응답 Body에도 생성된 Blog 객체를 담아 보냅니다.
        URI location = URI.create("/api/blogs/" + blogResponse.getId());
        return ResponseEntity.created(location).body(blogResponse);
    }

    // 블로그 목록 조회 API
    @GetMapping
    public ResponseEntity<List<BlogResponse>> getBlogList() {
        List<BlogResponse> blogList = blogService.getBlogList();
        return ResponseEntity.ok(blogList);
    }
}