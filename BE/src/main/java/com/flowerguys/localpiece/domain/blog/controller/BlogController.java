package com.flowerguys.localpiece.domain.blog.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowerguys.localpiece.domain.blog.dto.BlogCreateRequest;
import com.flowerguys.localpiece.domain.blog.dto.BlogResponse;
import com.flowerguys.localpiece.domain.blog.dto.BlogUpdateRequest;
import com.flowerguys.localpiece.domain.blog.service.BlogService;
import com.flowerguys.localpiece.domain.blog.dto.BlogListResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;
    private final ObjectMapper objectMapper;

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<BlogResponse> createBlog(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("request") String jsonRequest,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        
        BlogCreateRequest requestDto = objectMapper.readValue(jsonRequest, BlogCreateRequest.class);
        String email = userDetails.getUsername();
        BlogResponse blogResponse = blogService.createBlog(email, requestDto, images);

        return ResponseEntity.status(HttpStatus.CREATED).body(blogResponse);
    }

    @PutMapping(value = "/{blogId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable Long blogId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("request") String jsonRequest,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        
        BlogUpdateRequest requestDto = objectMapper.readValue(jsonRequest, BlogUpdateRequest.class);
        String email = userDetails.getUsername();
        BlogResponse updatedBlog = blogService.updateBlog(blogId, email, requestDto, images);
        
        return ResponseEntity.ok(updatedBlog);
    }
    
    @GetMapping
    public ResponseEntity<List<BlogListResponseDto>> getBlogList(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(blogService.getBlogList(userDetails));
    }

    @GetMapping("/{blogId}")
    public ResponseEntity<BlogResponse> getBlogDetail(
            @PathVariable Long blogId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(blogService.getBlogAndIncreaseViewCount(blogId, userDetails));
    }

    @DeleteMapping("/{blogId}")
    public ResponseEntity<Void> deleteBlog(
            @PathVariable Long blogId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        blogService.deleteBlog(blogId, email);
        return ResponseEntity.noContent().build();
    }
}