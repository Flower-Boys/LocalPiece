package com.flowerguys.localpiece.domain.tour.dto;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Getter;
import lombok.Setter;

@Component
@ConfigurationProperties(prefix = "tour-api")
@Getter
@Setter
public class TourApiProperties {
    private String baseUrl;
    private String serviceKey;
}
