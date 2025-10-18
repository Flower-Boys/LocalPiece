package com.flowerguys.localpiece.domain.mypage.controller;

import com.flowerguys.localpiece.domain.blog.dto.BlogListResponseDto;
import com.flowerguys.localpiece.domain.mypage.dto.MyInfoResponseDto;
import com.flowerguys.localpiece.domain.mypage.dto.PieceResponseDto;
import com.flowerguys.localpiece.domain.mypage.dto.PieceSaveRequestDto;
import com.flowerguys.localpiece.domain.mypage.service.MypageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MypageController {

    private final MypageService mypageService;

    @GetMapping("/info")
    public ResponseEntity<MyInfoResponseDto> getMyInfo(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(mypageService.getMyInfo(userDetails.getUsername()));
    }

    @GetMapping("/blogs")
    public ResponseEntity<List<BlogListResponseDto>> getMyBlogs(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(mypageService.getMyBlogs(userDetails.getUsername()));
    }

    @PostMapping("/pieces")
    public ResponseEntity<Map<String, Long>> savePiece(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PieceSaveRequestDto requestDto) {
        Long pieceId = mypageService.savePiece(userDetails.getUsername(), requestDto);
        return ResponseEntity.ok(Map.of("pieceId", pieceId));
    }

    @GetMapping("/pieces")
    public ResponseEntity<List<PieceResponseDto>> getMyPieces(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(mypageService.getMyPieces(userDetails.getUsername()));
    }
    
    @GetMapping("/pieces/{pieceId}")
    public ResponseEntity<PieceResponseDto> getPieceDetails(
            @PathVariable Long pieceId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(mypageService.getPieceDetails(pieceId, userDetails.getUsername()));
    }

    @DeleteMapping("/pieces/{pieceId}")
    public ResponseEntity<Void> deletePiece(
            @PathVariable Long pieceId,
            @AuthenticationPrincipal UserDetails userDetails) {
        mypageService.deletePiece(pieceId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}