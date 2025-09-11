package com.flowerguys.localpiece.domain.blog.dto;

import com.flowerguys.localpiece.domain.blog.entity.BlogImage;
import lombok.Getter;

@Getter
public class ImageInfo {
    private Long id;
    private String url;

    public ImageInfo(BlogImage blogImage) {
        this.id = blogImage.getId();
        this.url = blogImage.getImageUrl();
    }
}