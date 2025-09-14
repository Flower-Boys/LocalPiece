package com.flowerguys.localpiece.domain.tour.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowerguys.localpiece.domain.tour.dto.CategoryCodeDto;
import com.flowerguys.localpiece.domain.tour.dto.EventItemDto;
import com.flowerguys.localpiece.domain.tour.dto.LdongCodeDto;
import com.flowerguys.localpiece.domain.tour.dto.TourApiProperties;
import com.flowerguys.localpiece.domain.tour.dto.TourItemDto;
import com.flowerguys.localpiece.domain.tour.dto.TourItemWithDistDto;
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

    private static final String GYEONGBUK_LDONG_REGN_CD = "47";

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
     * 법정동 코드 조회 (기존 getSigunguCodes -> getLdongCodeList로 변경 및 확장)
     */
    public List<LdongCodeDto> getLdongCodeList(String ldongAreaCd, String lDongListYn) {
        String jsonString = callTourApi("/ldongCode2", builder -> {
            builder.queryParam("numOfRows", 100); // 충분한 결과 수를 위해 100으로 설정
            if (StringUtils.hasText(ldongAreaCd)) builder.queryParam("lDongRegnCd", ldongAreaCd);
            if (StringUtils.hasText(lDongListYn)) builder.queryParam("lDongListYn", lDongListYn);
        });
        return parseItems(jsonString, LdongCodeDto.class);
    }

    /**
     * 신규 분류체계 코드 조회
     */
    public List<CategoryCodeDto> getCategoryCodeList(String lclsSystm1, String lclsSystm2, String lclsSystmListYn) {
        String jsonString = callTourApi("/lclsSystmCode2", builder -> {
            builder.queryParam("numOfRows", 300); // 모든 카테고리를 가져오기 위해 충분히 큰 값 설정
            if (StringUtils.hasText(lclsSystm1)) builder.queryParam("lclsSystm1", lclsSystm1);
            if (StringUtils.hasText(lclsSystm2)) builder.queryParam("lclsSystm2", lclsSystm2);
            if (StringUtils.hasText(lclsSystmListYn)) builder.queryParam("lclsSystmListYn", lclsSystmListYn);
        });
        return parseItems(jsonString, CategoryCodeDto.class);
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

    /**
     * 위치기반 관광정보 조회
     */
    public List<TourItemWithDistDto> getLocationBasedList(
            String mapX, String mapY, int radius, String arrange, String contentTypeId,
            String lclsSystm1, String lclsSystm2, String lclsSystm3, String modifiedtime) {

        String jsonString = callTourApi("/locationBasedList2", builder -> {
            // 필수 파라미터
            builder.queryParam("mapX", mapX)
                   .queryParam("mapY", mapY)
                   .queryParam("radius", radius);

            // 옵션 파라미터
            if (StringUtils.hasText(arrange)) builder.queryParam("arrange", arrange);
            if (StringUtils.hasText(contentTypeId)) builder.queryParam("contentTypeId", contentTypeId);
            if (StringUtils.hasText(lclsSystm1)) builder.queryParam("lclsSystm1", lclsSystm1);
            if (StringUtils.hasText(lclsSystm2)) builder.queryParam("lclsSystm2", lclsSystm2);
            if (StringUtils.hasText(lclsSystm3)) builder.queryParam("lclsSystm3", lclsSystm3);
            if (StringUtils.hasText(modifiedtime)) builder.queryParam("modifiedtime", modifiedtime);
        });

        return parseItems(jsonString, TourItemWithDistDto.class);
    }

    /**
     * 키워드 기반 관광정보 조회
     */
    public List<TourItemDto> searchKeyword(
            String keyword, String arrange, String contentTypeId,
            String lclsSystm1, String lclsSystm2, String lclsSystm3,
            int pageNo, int numOfRows) {

        String jsonString = callTourApi("/searchKeyword2", builder -> {
            // 필수 파라미터
            builder.queryParam("keyword", keyword);
            
            // 경북 지역 내에서만 검색하도록 지역 코드 추가
            builder.queryParam("lDongRegnCd", GYEONGBUK_LDONG_REGN_CD);

            // 옵션 파라미터
            builder.queryParam("pageNo", pageNo)
                   .queryParam("numOfRows", numOfRows);
            if (StringUtils.hasText(arrange)) builder.queryParam("arrange", arrange);
            if (StringUtils.hasText(contentTypeId)) builder.queryParam("contentTypeId", contentTypeId);
            if (StringUtils.hasText(lclsSystm1)) builder.queryParam("lclsSystm1", lclsSystm1);
            if (StringUtils.hasText(lclsSystm2)) builder.queryParam("lclsSystm2", lclsSystm2);
            if (StringUtils.hasText(lclsSystm3)) builder.queryParam("lclsSystm3", lclsSystm3);
        });

        return parseItems(jsonString, TourItemDto.class);
    }

    /**
     * 행사정보 조회
     */
    public List<EventItemDto> searchFestival(
            String eventStartDate, String eventEndDate, String arrange,
            String lclsSystm1, String lclsSystm2, String lclsSystm3,
            int pageNo, int numOfRows) {

        String jsonString = callTourApi("/searchFestival2", builder -> {
            // 필수 파라미터
            builder.queryParam("eventStartDate", eventStartDate);

            // 경북 지역 내에서만 검색하도록 지역 코드 추가
            builder.queryParam("lDongRegnCd", GYEONGBUK_LDONG_REGN_CD);

            // 옵션 파라미터
            builder.queryParam("pageNo", pageNo)
                   .queryParam("numOfRows", numOfRows);
            if (StringUtils.hasText(eventEndDate)) builder.queryParam("eventEndDate", eventEndDate);
            if (StringUtils.hasText(arrange)) builder.queryParam("arrange", arrange);
            if (StringUtils.hasText(lclsSystm1)) builder.queryParam("lclsSystm1", lclsSystm1);
            if (StringUtils.hasText(lclsSystm2)) builder.queryParam("lclsSystm2", lclsSystm2);
            if (StringUtils.hasText(lclsSystm3)) builder.queryParam("lclsSystm3", lclsSystm3);
        });

        return parseItems(jsonString, EventItemDto.class);
    }

    /**
     * 숙박정보 조회
     */
    public List<TourItemDto> searchStay(
            String arrange, String lclsSystm1, String lclsSystm2, String lclsSystm3,
            int pageNo, int numOfRows) {

        String jsonString = callTourApi("/searchStay2", builder -> {
            // 경북 지역 내 숙박업소만 조회
            builder.queryParam("lDongRegnCd", GYEONGBUK_LDONG_REGN_CD);

            // 옵션 파라미터
            builder.queryParam("pageNo", pageNo)
                   .queryParam("numOfRows", numOfRows)
                   .queryParam("arrange", arrange);
            if (StringUtils.hasText(lclsSystm1)) builder.queryParam("lclsSystm1", lclsSystm1);
            if (StringUtils.hasText(lclsSystm2)) builder.queryParam("lclsSystm2", lclsSystm2);
            if (StringUtils.hasText(lclsSystm3)) builder.queryParam("lclsSystm3", lclsSystm3);
        });

        return parseItems(jsonString, TourItemDto.class);
    }
}