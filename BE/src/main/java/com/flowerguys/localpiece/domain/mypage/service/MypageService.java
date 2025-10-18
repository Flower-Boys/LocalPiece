package com.flowerguys.localpiece.domain.mypage.service;

import com.flowerguys.localpiece.domain.blog.dto.BlogListResponseDto;
import com.flowerguys.localpiece.domain.blog.repository.BlogRepository;
import com.flowerguys.localpiece.domain.course.dto.DailyCourseDto;
import com.flowerguys.localpiece.domain.course.dto.PlaceDto;
import com.flowerguys.localpiece.domain.like.repository.BlogLikeRepository;
import com.flowerguys.localpiece.domain.mypage.dto.MyInfoResponseDto;
import com.flowerguys.localpiece.domain.mypage.dto.PieceResponseDto;
import com.flowerguys.localpiece.domain.mypage.dto.PieceSaveRequestDto;
import com.flowerguys.localpiece.domain.piece.entity.Piece;
import com.flowerguys.localpiece.domain.piece.entity.PieceDay;
import com.flowerguys.localpiece.domain.piece.entity.PiecePlace;
import com.flowerguys.localpiece.domain.piece.repository.PieceRepository;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.domain.user.repository.UserRepository;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
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

    @Transactional(readOnly = true)
    public MyInfoResponseDto getMyInfo(String email) {
        User user = findUser(email);
        return new MyInfoResponseDto(user);
    }

    @Transactional(readOnly = true)
    public List<BlogListResponseDto> getMyBlogs(String email) {
        User user = findUser(email);
        Set<Long> likedBlogIds = blogLikeRepository.findLikedBlogIdsByUserId(user.getId());

        return blogRepository.findAllByUserEmailAndIsDeletedFalseOrderByCreatedAtDesc(email).stream()
                .map(blog -> new BlogListResponseDto(blog, likedBlogIds.contains(blog.getId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public Long savePiece(String email, PieceSaveRequestDto requestDto) {
        User user = findUser(email);

        Piece piece = Piece.builder()
                .user(user)
                .tripTitle(requestDto.getTripTitle())
                .themeTitle(requestDto.getCourseOption().getThemeTitle())
                .build();

        for (DailyCourseDto dayDto : requestDto.getCourseOption().getDays()) {
            PieceDay pieceDay = PieceDay.builder()
                    .day(dayDto.getDay())
                    .date(dayDto.getDate())
                    .build();

            for (PlaceDto placeDto : dayDto.getRoute()) {
                PiecePlace piecePlace = PiecePlace.builder()
                        .orderNum(placeDto.getOrder())
                        .contentId(placeDto.getContentId())
                        .type(placeDto.getType())
                        .name(placeDto.getName())
                        .category(placeDto.getCategory())
                        .address(placeDto.getAddress())
                        .arrivalTime(placeDto.getArrivalTime())
                        .departureTime(placeDto.getDepartureTime())
                        .durationMinutes(placeDto.getDurationMinutes())
                        .build();
                pieceDay.addPlace(piecePlace);
            }
            piece.addDay(pieceDay);
        }

        Piece savedPiece = pieceRepository.save(piece);
        return savedPiece.getId();
    }

    @Transactional(readOnly = true)
    public List<PieceResponseDto> getMyPieces(String email) {
        return pieceRepository.findAllByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(PieceResponseDto::new)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PieceResponseDto getPieceDetails(Long pieceId, String email) {
        return pieceRepository.findByIdAndUserEmail(pieceId, email)
                .map(PieceResponseDto::new)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCESS_DENIED, "해당 조각에 대한 접근 권한이 없습니다."));
    }
    
    @Transactional
    public void deletePiece(Long pieceId, String email) {
        Piece piece = pieceRepository.findByIdAndUserEmail(pieceId, email)
                .orElseThrow(() -> new BusinessException(ErrorCode.ACCESS_DENIED, "해당 조각에 대한 접근 권한이 없습니다."));
        pieceRepository.delete(piece);
    }
}