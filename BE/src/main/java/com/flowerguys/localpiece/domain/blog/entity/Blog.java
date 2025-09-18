package com.flowerguys.localpiece.domain.blog.entity;

import com.flowerguys.localpiece.domain.like.entity.BlogLike;
import com.flowerguys.localpiece.domain.user.entity.User;
import com.flowerguys.localpiece.global.common.BaseTimeEntity;
import com.flowerguys.localpiece.domain.comment.entity.Comment;
import com.flowerguys.localpiece.domain.like.entity.BlogLike;
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA를 위한 기본 생성자
@AllArgsConstructor // 모든 필드를 포함하는 생성자 (Builder가 사용)
@Builder // 클래스 레벨에 Builder 적용
public class Blog extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blog_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "blog_title", nullable = false)
    private String title;

    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequence ASC")
    @Builder.Default
    private List<BlogContent> contents = new ArrayList<>();

    @Builder.Default
    private boolean isPrivate = false;

    @Builder.Default
    private boolean isDeleted = false;

    @Builder.Default
    private int viewCount = 0;

    @Setter
    private String thumbnail; 

    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "blog", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<BlogLike> likes = new HashSet<>();
    
    // Setter 대신 의미있는 이름의 메소드를 사용
    public void setContents(List<BlogContent> contents) {
        this.contents = contents;
    }
    
    public void update(String title, Boolean isPrivate) {
        if (title != null) this.title = title;
        if (isPrivate != null) this.isPrivate = isPrivate;
    }

    public void delete() {
        this.isDeleted = true;
    }
}