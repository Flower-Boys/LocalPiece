package com.flowerguys.localpiece.domain.comment.entity;

import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Comment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;

    @Column(nullable = false, length = 1000)
    private String content;

    @Builder
    public Comment(User user, Blog blog, String content) {
        this.user = user;
        this.blog = blog;
        this.content = content;
    }

    public void update(String content) {
        if (content != null) {
            this.content = content;
        }
    }
}