package com.flowerguys.localpiece.domain.tour.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowerguys.localpiece.domain.tour.dto.SigunguCodeDto;
import com.flowerguys.localpiece.domain.tour.dto.TourApiProperties;
import com.flowerguys.localpiece.domain.tour.dto.TourItemDto;
import com.flowerguys.localpiece.global.common.ErrorCode;
import com.flowerguys.localpiece.global.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourService {

    private final RestTemplate restTemplate;
    private final TourApiProperties apiProperties;
    private final ObjectMapper objectMapper;

    // 경상북도 신규 법정동 시도 코드
    private static final String GYEONGBUK_LDONG_REGN_CD = "47";

    /**
     * 관광정보 조회 (신규 법정동 코드, 관광타입 필터링)
     */
    public List<TourItemDto> getAreaBasedList(String sigunguCode, String contentTypeId, int pageNo) {
        String jsonString = callTourApi("/areaBasedList2", sigunguCode, contentTypeId, pageNo);
        return parseItems(jsonString, TourItemDto.class);
    }

    /**
     * 경상북도 내 시군구 코드 목록 조회
     */
    public List<SigunguCodeDto> getSigunguCodes() {
        String jsonString = callTourApi("/ldongCode2", null, null, 1);
        return parseItems(jsonString, SigunguCodeDto.class);
    }

    /**
     * TourAPI 호출 공통 로직
     */
    private String callTourApi(String path, String sigunguCode, String contentTypeId, int pageNo) {
        DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory();
        factory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE);
        restTemplate.setUriTemplateHandler(factory);

        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(apiProperties.getBaseUrl())
                .path(path)
                .queryParam("serviceKey", apiProperties.getServiceKey())
                .queryParam("MobileOS", "WEB")
                .queryParam("MobileApp", "LocalPiece")
                .queryParam("_type", "json");

        if ("/areaBasedList2".equals(path)) {
            builder.queryParam("numOfRows", 12)
                    .queryParam("pageNo", pageNo)
                    .queryParam("arrange", "A")
                    .queryParam("lDongRegnCd", GYEONGBUK_LDONG_REGN_CD);
            if (sigunguCode != null) builder.queryParam("lDongSignguCd", sigunguCode);
            if (contentTypeId != null) builder.queryParam("contentTypeId", contentTypeId);
        } else if ("/ldongCode2".equals(path)) {
            builder.queryParam("lDongRegnCd", GYEONGBUK_LDONG_REGN_CD)
                    .queryParam("numOfRows", 100);
        }

        URI uri = builder.build(true).toUri();
        log.info("Request URI to TourAPI: {}", uri);

        try {
            return restTemplate.getForObject(uri, String.class);
        } catch (RestClientException e) {
            log.error("TourAPI 호출 중 RestClientException 발생: {}", e.getMessage());
            throw new BusinessException(ErrorCode.TOUR_API_ERROR);
        }
    }

    /**
     * JSON 응답 파싱 및 DTO 변환 공통 로직 (예외 처리 포함)
     */
    private <T> List<T> parseItems(String jsonString, Class<T> itemClass) {
        try {
            JsonNode root = objectMapper.readTree(jsonString);

            JsonNode header = root.path("response").path("header");
            String resultCode = header.path("resultCode").asText();
            if (!"0000".equals(resultCode)) {
                String resultMsg = header.path("resultMsg").asText();
                log.error("TourAPI 에러 응답: resultCode={}, resultMsg={}", resultCode, resultMsg);
                throw new BusinessException(ErrorCode.TOUR_API_ERROR);
            }

            JsonNode itemsNode = root.path("response").path("body").path("items").path("item");

            if (itemsNode.isMissingNode() || itemsNode.isNull() || !itemsNode.isArray()) {
                return Collections.emptyList();
            }

            return objectMapper.readerForListOf(itemClass).readValue(itemsNode);
        } catch (IOException e) {
            log.error("TourAPI 응답 JSON 파싱 중 IOException 발생: {}", e.getMessage());
            throw new BusinessException(ErrorCode.TOUR_API_ERROR);
        }
    }
}