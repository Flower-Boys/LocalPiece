package com.flowerguys.localpiece.blog.controller;

import com.flowerguys.localpiece.blog.dto.BlogCreateRequest;
import com.flowerguys.localpiece.blog.dto.BlogResponse;
import com.flowerguys.localpiece.blog.service.BlogService;
import lombok.RequiredArgsConstructor;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

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
}