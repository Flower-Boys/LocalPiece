package com.flowerguys.localpiece.domain.comment.service;

import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.blog.repository.BlogRepository;
import com.flowerguys.localpiece.domain.comment.dto.CommentRequestDto;
import com.flowerguys.localpiece.domain.comment.dto.CommentResponseDto;
import com.flowerguys.localpiece.domain.comment.entity.Comment;
import com.flowerguys.localpiece.domain.comment.repository.CommentRepository;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.domain.user.repository.UserRepository;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final BlogRepository blogRepository;

    @Transactional
    public CommentResponseDto createComment(Long blogId, String email, CommentRequestDto requestDto) {
        User user = findUser(email);
        Blog blog = findBlog(blogId);

        Comment comment = Comment.builder()
                .user(user)
                .blog(blog)
                .content(requestDto.getContent())
                .build();

        Comment savedComment = commentRepository.save(comment);
        return new CommentResponseDto(savedComment);
    }

    @Transactional
    public CommentResponseDto updateComment(Long commentId, String email, CommentRequestDto requestDto) {
        User user = findUser(email);
        Comment comment = findComment(commentId);
        checkOwnership(comment, user);

        comment.update(requestDto.getContent());
        return new CommentResponseDto(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, String email) {
        User user = findUser(email);
        Comment comment = findComment(commentId);
        checkOwnership(comment, user);

        commentRepository.delete(comment);
    }
    
    private User findUser(String email) {
        return userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private Blog findBlog(Long blogId) {
        return blogRepository.findActiveById(blogId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BLOG_NOT_FOUND));
    }

    private Comment findComment(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMENT_NOT_FOUND));
    }

    private void checkOwnership(Comment comment, User user) {
        if (!comment.getUser().equals(user)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED, "댓글에 대한 권한이 없습니다.");
        }
    }
}