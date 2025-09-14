package com.flowerguys.localpiece.domain.like.entity;

import com.flowerguys.localpiece.domain.blog.entity.Blog;
import com.flowerguys.localpiece.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
    name = "blog_like",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "like_uk",
            columnNames = {"user_id", "blog_id"}
        )
    }
)
public class BlogLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "like_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;

    @Builder
    public BlogLike(User user, Blog blog) {
        this.user = user;
        this.blog = blog;
    }
}