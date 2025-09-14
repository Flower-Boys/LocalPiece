package com.flowerguys.localpiece.domain.like.service;

import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.blog.repository.BlogRepository;
import com.flowerguys.localpiece.domain.like.entity.BlogLike;
import com.flowerguys.localpiece.domain.like.repository.BlogLikeRepository;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.domain.user.repository.UserRepository;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final BlogLikeRepository blogLikeRepository;
    private final UserRepository userRepository;
    private final BlogRepository blogRepository;

    @Transactional
    public String toggleLike(Long blogId, String email) {
        User user = findUser(email);
        Blog blog = findBlog(blogId);

        // 이미 좋아요를 눌렀는지 확인
        return blogLikeRepository.findByUserIdAndBlogId(user.getId(), blog.getId())
                .map(like -> {
                    // 이미 좋아요를 눌렀다면 -> 좋아요 취소
                    blogLikeRepository.delete(like);
                    return "좋아요가 취소되었습니다.";
                })
                .orElseGet(() -> {
                    // 좋아요를 누르지 않았다면 -> 좋아요 추가
                    BlogLike newLike = BlogLike.builder()
                            .user(user)
                            .blog(blog)
                            .build();
                    blogLikeRepository.save(newLike);
                    return "좋아요를 눌렀습니다.";
                });
    }

    private User findUser(String email) {
        return userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private Blog findBlog(Long blogId) {
        return blogRepository.findById(blogId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BLOG_NOT_FOUND));
    }
}