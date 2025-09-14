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
import org.springframework.util.StringUtils;
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

    // 경상북도 신규 법정동 시도 코드 (유지)
    private static final String GYEONGBUK_LDONG_REGN_CD = "47";

    /**
     * 관광정보 조회 (최종 수정본)
     */
    public List<TourItemDto> getAreaBasedList(
            String sigunguCode, String contentTypeId, int pageNo, int numOfRows, String arrange,
            String lclsSystm1, String lclsSystm2, String lclsSystm3, String modifiedtime) {

        String jsonString = callTourApi("/areaBasedList2", builder -> {
            builder.queryParam("numOfRows", numOfRows)
                   .queryParam("pageNo", pageNo)
                   .queryParam("arrange", arrange)
                   .queryParam("lDongRegnCd", GYEONGBUK_LDONG_REGN_CD);

            if (StringUtils.hasText(sigunguCode)) builder.queryParam("lDongSignguCd", sigunguCode);
            if (StringUtils.hasText(contentTypeId)) builder.queryParam("contentTypeId", contentTypeId);
            if (StringUtils.hasText(lclsSystm1)) builder.queryParam("lclsSystm1", lclsSystm1);
            if (StringUtils.hasText(lclsSystm2)) builder.queryParam("lclsSystm2", lclsSystm2);
            if (StringUtils.hasText(lclsSystm3)) builder.queryParam("lclsSystm3", lclsSystm3);
            if (StringUtils.hasText(modifiedtime)) builder.queryParam("modifiedtime", modifiedtime);
        });

        return parseItems(jsonString, TourItemDto.class);
    }

    /**
     * 경상북도 내 시군구 코드 목록 조회 (기존 코드 유지)
     */
    public List<SigunguCodeDto> getSigunguCodes() {
        String jsonString = callTourApi("/ldongCode2", builder -> {
            builder.queryParam("lDongRegnCd", GYEONGBUK_LDONG_REGN_CD)
                   .queryParam("numOfRows", 100);
        });
        return parseItems(jsonString, SigunguCodeDto.class);
    }

    @FunctionalInterface
    private interface UriBuilderCustomizer {
        void customize(UriComponentsBuilder builder);
    }

    private String callTourApi(String path, UriBuilderCustomizer customizer) {
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

        customizer.customize(builder);

        URI uri = builder.build(true).toUri();
        log.info("Request URI to TourAPI: {}", uri);

        try {
            return restTemplate.getForObject(uri, String.class);
        } catch (RestClientException e) {
            log.error("TourAPI 호출 중 RestClientException 발생: {}", e.getMessage());
            throw new BusinessException(ErrorCode.TOUR_API_ERROR);
        }
    }

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