package com.flowerguys.localpiece.domain.tour.service;

import com.flowerguys.localpiece.domain.tour.dto.TourApiProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
@RequiredArgsConstructor
public class TourService {

    private final RestTemplate restTemplate;
    private final TourApiProperties apiProperties;

    /**
     * 지역기반 관광정보를 조회합니다.
     * @param areaCode 지역코드 (예: 1=서울, 31=경기)
     * @return TourAPI로부터 받은 원본 JSON 문자열
     */
    public String getAreaBasedList(String areaCode) {

        // TourAPI 서비스 키가 인코딩되는 것을 방지하기 위한 설정
        DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory();
        factory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE);
        restTemplate.setUriTemplateHandler(factory);

        URI uri = UriComponentsBuilder
                .fromUriString(apiProperties.getBaseUrl())
                .path("/areaBasedList1")
                .queryParam("serviceKey", apiProperties.getServiceKey())
                .queryParam("numOfRows", 10) // 10개만 가져오도록 설정 (필요에 따라 변경)
                .queryParam("pageNo", 1)
                .queryParam("MobileOS", "ETC")
                .queryParam("MobileApp", "LocalPiece")
                .queryParam("_type", "json")
                .queryParam("listYN", "Y")
                .queryParam("arrange", "A")
                .queryParam("areaCode", areaCode)
                .build(true)
                .toUri();

        return restTemplate.getForObject(uri, String.class);
    }
}
