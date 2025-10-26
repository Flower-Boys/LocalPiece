package com.flowerguys.localpiece.domain.mypage.service;

import com.flowerguys.localpiece.domain.blog.dto.BlogListResponseDto;
import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.blog.repository.BlogRepository;
import com.flowerguys.localpiece.domain.like.repository.BlogLikeRepository;
import com.flowerguys.localpiece.domain.mypage.dto.MyInfoResponseDto;
import com.flowerguys.localpiece.domain.mypage.dto.PieceListResponseDto;
import com.flowerguys.localpiece.domain.mypage.dto.PieceSaveRequestDto;
import com.flowerguys.localpiece.domain.piece.entity.Piece;
import com.flowerguys.localpiece.domain.piece.repository.PieceRepository;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.domain.user.repository.UserRepository;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MypageService {

    private final UserRepository userRepository;
    private final BlogRepository blogRepository;
    private final BlogLikeRepository blogLikeRepository;
    private final PieceRepository pieceRepository;

    private User findUser(String email) {
        return userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    // --- 내 정보 및 내가 쓴 블로그 ---
    @Transactional(readOnly = true)
    public MyInfoResponseDto getMyInfo(String email) {
        User user = findUser(email);
        return new MyInfoResponseDto(user);
    }

    @Transactional(readOnly = true)
    public List<BlogListResponseDto> getMyBlogs(String email) {
        User user = findUser(email);
        Set<Long> likedBlogIds = blogLikeRepository.findLikedBlogIdsByUserId(user.getId());

        List<Blog> myBlogs = blogRepository.findAllByUserAndIsDeletedFalseOrderByCreatedAtDesc(user);

        return myBlogs.stream()
                .map(blog -> new BlogListResponseDto(blog, likedBlogIds.contains(blog.getId())))
                .collect(Collectors.toList());
    }

    // --- 여행 조각(Piece) 관련 로직 ---
    @Transactional
    public Long savePiece(String email, PieceSaveRequestDto requestDto) {
        User user = findUser(email);

        Blog blog = blogRepository.findActiveById(requestDto.getBlogId())
                .orElseThrow(() -> new BusinessException(ErrorCode.BLOG_NOT_FOUND));

        if (pieceRepository.existsByUserAndBlogId(user, blog.getId())) {
            throw new BusinessException(ErrorCode.INVALID_ARGUMENT, "이미 조각으로 저장된 블로그입니다.");
        }

        Piece piece = Piece.builder()
                .user(user)
                .blog(blog)
                .city(requestDto.getCity())
                .build();

        return pieceRepository.save(piece).getId();
    }

    @Transactional(readOnly = true)
    public List<PieceListResponseDto> getMyPieces(String email) {
        return pieceRepository.findAllByUserEmailWithBlog(email).stream()
                .map(PieceListResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePiece(Long pieceId, String email) {
        Piece piece = pieceRepository.findByIdAndUserEmail(pieceId, email)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCESS_DENIED, "해당 조각을 삭제할 권한이 없습니다."));
        pieceRepository.delete(piece);
    }
}