package com.flowerguys.localpiece.domain.blog.controller;

import lombok.RequiredArgsConstructor;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.flowerguys.localpiece.domain.blog.dto.BlogCreateRequest;
import com.flowerguys.localpiece.domain.blog.dto.BlogResponse;
import com.flowerguys.localpiece.domain.blog.dto.BlogUpdateRequest;
import com.flowerguys.localpiece.domain.blog.service.BlogService;

import io.swagger.v3.oas.annotations.Operation;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.util.List;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    // 블로그 생성 API
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "블로그 생성", description = "블로그를 생성합니다.")
    public ResponseEntity<BlogResponse> createBlog(
            @ModelAttribute @Valid BlogCreateRequest request, 
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        BlogResponse blogResponse = blogService.createBlog(email, request, images);

        URI location = URI.create("/api/blogs/" + blogResponse.getId());
        return ResponseEntity.created(location).body(blogResponse);
    }

    // 블로그 목록 조회 API
    @GetMapping
    public ResponseEntity<List<BlogResponse>> getBlogList() {
        List<BlogResponse> blogList = blogService.getBlogList();
        return ResponseEntity.ok(blogList);
    }

    // 블로그 상세 조회 API
    @GetMapping("/{blogId}")
    public ResponseEntity<BlogResponse> getBlogDetail(
            @PathVariable Long blogId,
            @AuthenticationPrincipal UserDetails userDetails) {

        // ⬇️ 서비스의 단일 메소드 호출
        BlogResponse blogDetail = blogService.getBlogAndIncreaseViewCount(blogId, userDetails);
        
        return ResponseEntity.ok(blogDetail);
    }

    // 블로그 수정 API
    @PatchMapping(value = "/{blogId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable Long blogId,
            @ModelAttribute @Valid BlogUpdateRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String email = userDetails.getUsername();
        BlogResponse updatedBlog = blogService.updateBlog(blogId, email, request, images);
        
        return ResponseEntity.ok(updatedBlog);
    }

    // 블로그 삭제 API
    @DeleteMapping("/{blogId}")
    public ResponseEntity<Void> deleteBlog(
            @PathVariable Long blogId,
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        blogService.deleteBlog(blogId, email);
        
        return ResponseEntity.noContent().build(); // ⬅️ 삭제 성공 시 표준 응답 (204 No Content)
    }
}