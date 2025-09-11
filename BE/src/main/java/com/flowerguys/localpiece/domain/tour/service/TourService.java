package com.flowerguys.localpiece.domain.tour.service;

import com.flowerguys.localpiece.domain.tour.dto.TourApiProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Slf4j
@Service
@RequiredArgsConstructor
public class TourService {

    private final RestTemplate restTemplate;
    private final TourApiProperties apiProperties;

    // 경상북도 지역 코드 상수
    private static final String GYEONGBUK_LDONG_REGN_CD = "47"; // 대구 27

    /**
     * [TourAPI] 지역기반 관광정보를 조회합니다. (경상북도 전용)
     * @param sigunguCode 시군구코드 (옵션, 없으면 경북 전체 조회)
     * @param contentTypeId 관광타입 ID (옵션. 12:관광지, 32:숙박, 39:음식점 등)
     * @param pageNo 페이지 번호
     * @return TourAPI로부터 받은 원본 JSON 문자열
     */
    public String getAreaBasedList(String sigunguCode, String contentTypeId, int pageNo) {

        // 💡 중요: TourAPI 서비스 키가 URL 인코딩되는 것을 방지합니다.
        // 서비스 키에 포함된 '%', '/' 같은 특수문자가 깨지지 않도록 처리합니다.
        DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory();
        factory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE);
        restTemplate.setUriTemplateHandler(factory);

        // UriComponentsBuilder를 사용하여 동적으로 URI 생성
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(apiProperties.getBaseUrl())
                .path("/areaBasedList2") // ⬅️ 매뉴얼에 명시된 최신 Endpoint로 수정
                .queryParam("serviceKey", apiProperties.getServiceKey())
                .queryParam("numOfRows", 12) // 한 페이지에 12개씩 표시
                .queryParam("pageNo", pageNo)
                .queryParam("MobileOS", "WEB") // ⬅️ 필수 파라미터
                .queryParam("MobileApp", "LocalPiece") // ⬅️ 필수 파라미터 (서비스명)
                .queryParam("_type", "json")
                .queryParam("arrange", "A") // 정렬구분 (A=제목순, C=수정일순, D=생성일순) 대표이미지가반드시있는정렬(O=제목순, Q=수정일순, R=생성일순)
                .queryParam("lDongRegnCd", GYEONGBUK_LDONG_REGN_CD); // 경상북도 코드로 고정

        // sigunguCode가 있을 경우에만 쿼리 파라미터에 추가
        if (sigunguCode != null && !sigunguCode.isEmpty()) {
            builder.queryParam("sigunguCode", sigunguCode);
        }

        // 관광타입 ID가 있을 경우, contentTypeId 파라미터 추가
        if (contentTypeId != null && !contentTypeId.isEmpty()) {
            builder.queryParam("contentTypeId", contentTypeId);
        }

        URI uri = builder.build(true).toUri();
        log.info("Request URI to TourAPI: {}", uri); // ⬅️ 실제 요청 URI를 로그로 확인

        try {
            return restTemplate.getForObject(uri, String.class);
        } catch (Exception e) {
            log.error("Error while calling TourAPI: {}", e.getMessage());
            // 실제 프로덕션에서는 더 정교한 예외 처리가 필요합니다.
            throw new RuntimeException("TourAPI 호출 중 오류가 발생했습니다.");
        }
    }

    /**
     * [TourAPI] 법정동 코드 목록을 조회합니다. (경상북도 내 시군구)
     * @return 시군구 코드 및 이름 목록 JSON 문자열
     */
    public String getSigunguCodes() {
        DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory();
        factory.setEncodingMode(DefaultUriBuilderFactory.EncodingMode.NONE);
        restTemplate.setUriTemplateHandler(factory);

        URI uri = UriComponentsBuilder
                .fromUriString(apiProperties.getBaseUrl())
                .path("/ldongCode2") // ⬅️ 법정동 코드 조회 엔드포인트
                .queryParam("serviceKey", apiProperties.getServiceKey())
                .queryParam("MobileOS", "WEB")
                .queryParam("MobileApp", "LocalPiece")
                .queryParam("_type", "json")
                .queryParam("lDongRegnCd", GYEONGBUK_LDONG_REGN_CD) // ⬅️ 경상북도 코드로 조회
                .queryParam("lDongListYn", "Y") // ⬅️ 전체 목록 조회
                .build(true)
                .toUri();
        
        log.info("Request URI for Sigungu Codes: {}", uri);

        try {
            return restTemplate.getForObject(uri, String.class);
        } catch (Exception e) {
            log.error("Error while calling TourAPI for Sigungu Codes: {}", e.getMessage());
            throw new RuntimeException("TourAPI 시군구 코드 조회 중 오류가 발생했습니다.");
        }
    }
}


