package com.flowerguys.localpiece.domain.blog.entity;

import com.flowerguys.localpiece.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "blog_image")
public class BlogImage extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long id;

    // Blog 엔티티와의 관계 설정 (이미지 N : 1 블로그)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id")
    private Blog blog;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Builder
    public BlogImage(Blog blog, String imageUrl) {
        this.blog = blog;
        this.imageUrl = imageUrl;
    }
}