package com.flowerguys.localpiece.domain.ai.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.lang.GeoLocation;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.exif.GpsDirectory;
import com.flowerguys.localpiece.domain.ai.dto.ImageMetadataDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.TimeZone;


@Slf4j
@Service
@RequiredArgsConstructor
public class MetadataService {

    public ImageMetadataDto extractMetadata(byte[] imageBytes, String originalFilename, String imageUrl) {
        ImageMetadataDto.ImageMetadataDtoBuilder builder = ImageMetadataDto.builder()
                .url(imageUrl)
                .filename(originalFilename);

        try (InputStream inputStream = new ByteArrayInputStream(imageBytes)) {
            Metadata metadata = ImageMetadataReader.readMetadata(inputStream);

            // 1. 촬영 시간(Timestamp) 추출
            ExifSubIFDDirectory exifDir = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
            if (exifDir != null) {
                // 서버의 기본 시간대를 기준으로 날짜를 가져옵니다.
                Date originalDate = exifDir.getDateOriginal(TimeZone.getDefault());
                if (originalDate != null) {
                    LocalDateTime timestamp = originalDate.toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime();
                    builder.timestamp(timestamp);
                    
                    // [로그 추가] 추출된 촬영 시간 확인
                    log.info("✅ [메타데이터] 파일: {}, 촬영 시간: {}", originalFilename, timestamp);
                }
            }

            // 2. 위치 정보(GPS) 추출
            GpsDirectory gpsDir = metadata.getFirstDirectoryOfType(GpsDirectory.class);
            if (gpsDir != null) {
                GeoLocation geoLocation = gpsDir.getGeoLocation();
                if (geoLocation != null) {
                    builder.latitude(geoLocation.getLatitude());
                    builder.longitude(geoLocation.getLongitude());

                    // [로그 추가] 추출된 GPS 정보 확인
                    log.info("✅ [메타데이터] 파일: {}, 위도: {}, 경도: {}", originalFilename, geoLocation.getLatitude(), geoLocation.getLongitude());
                }
            }

        } catch (Exception e) {
            log.warn("메타데이터 추출 실패 (파일: {}): {}", originalFilename, e.getMessage());
        }

        return builder.build();
    }
}