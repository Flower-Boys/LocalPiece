package com.flowerguys.localpiece.blog.entity;

import com.flowerguys.localpiece.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "blog")
public class Blog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blog_id")
    private Long id;

    // User 엔티티와의 관계 설정 (블로그 N : 1 유저)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "blog_title", nullable = false)
    private String title;

    // @Lob // 긴 텍스트를 위한 어노테이션
    @Column(name = "blog_content", nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "is_private", nullable = false)
    private boolean isPrivate = false;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.modifiedAt = LocalDateTime.now();
    }
    
    @Builder
    public Blog(User user, String title, String content, boolean isPrivate) {
        this.user = user;
        this.title = title;
        this.content = content;
        this.isPrivate = isPrivate;
    }
}