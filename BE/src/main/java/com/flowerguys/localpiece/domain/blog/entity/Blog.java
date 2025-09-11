package com.flowerguys.localpiece.domain.blog.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.global.common.BaseTimeEntity;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "blog")
public class Blog extends BaseTimeEntity {

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

    // 조회수 추가
    @Column(name = "view_count")
    private int viewCount = 0;

    public void increaseViewCount() {
        this.viewCount++;
    }
    
    @Builder.Default
    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BlogImage> images = new ArrayList<>();


    public Blog(User user, String title, String content, boolean isPrivate) {
        this.user = user;
        this.title = title;
        this.content = content;
        this.isPrivate = isPrivate;
    }

    // 수정 메소드
    public void update(String title, String content, Boolean isPrivate) {
        if (title != null) {
            this.title = title;
        }
        if (content != null) {
            this.content = content;
        }
        if (isPrivate != null) {
            this.isPrivate = isPrivate;
        }
    }

    // 삭제 메소드 (논리적 삭제)
    public void delete() {
        this.isDeleted = true;
    }
}