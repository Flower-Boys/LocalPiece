package com.flowerguys.localpiece.domain.blog.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "blog_content")
public class BlogContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "content_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;

    @Column(nullable = false)
    private int sequence; // 블록의 순서

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentType contentType; // 블록의 타입 (TEXT 또는 IMAGE)

    @Lob
    @Column(nullable = false)
    private String content; // 텍스트 내용 또는 이미지 URL

    @Builder
    public BlogContent(Blog blog, int sequence, ContentType contentType, String content) {
        this.blog = blog;
        this.sequence = sequence;
        this.contentType = contentType;
        this.content = content;
    }

    // 연관관계 편의 메소드
    public void setBlog(Blog blog) {
        this.blog = blog;
    }
}