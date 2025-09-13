package com.flowerguys.localpiece.domain.ai.controller;

import com.flowerguys.localpiece.domain.ai.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping(value = "/generate-blog", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Long>> generateAiBlog(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("city") String city,
            @RequestPart("images") List<MultipartFile> images) {

        String userEmail = userDetails.getUsername();
        Long newBlogId = aiService.generateAiBlog(userEmail, city, images);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("blogId", newBlogId));
    }
}