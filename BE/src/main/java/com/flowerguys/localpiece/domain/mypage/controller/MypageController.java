package com.flowerguys.localpiece.domain.mypage.controller;

import com.flowerguys.localpiece.domain.blog.dto.BlogListResponseDto;
import com.flowerguys.localpiece.domain.mypage.dto.MyInfoResponseDto;
import com.flowerguys.localpiece.domain.mypage.dto.PieceListResponseDto;
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

    // 내 정보 보기
    @GetMapping("/info")
    public ResponseEntity<MyInfoResponseDto> getMyInfo(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(mypageService.getMyInfo(userDetails.getUsername()));
    }

    // 내가 쓴 블로그 목록
    @GetMapping("/blogs")
    public ResponseEntity<List<BlogListResponseDto>> getMyBlogs(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(mypageService.getMyBlogs(userDetails.getUsername()));
    }

    // 여행 조각(Piece) 저장
    @PostMapping("/pieces")
    public ResponseEntity<Map<String, Long>> savePiece(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PieceSaveRequestDto requestDto) {
        Long pieceId = mypageService.savePiece(userDetails.getUsername(), requestDto);
        return ResponseEntity.ok(Map.of("pieceId", pieceId));
    }

    // 내 여행 조각(Piece) 목록 보기
    @GetMapping("/pieces")
    public ResponseEntity<List<PieceListResponseDto>> getMyPieces(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(mypageService.getMyPieces(userDetails.getUsername()));
    }

    // 여행 조각(Piece) 삭제
    @DeleteMapping("/pieces/{pieceId}")
    public ResponseEntity<Void> deletePiece(
            @PathVariable Long pieceId,
            @AuthenticationPrincipal UserDetails userDetails) {
        mypageService.deletePiece(pieceId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}