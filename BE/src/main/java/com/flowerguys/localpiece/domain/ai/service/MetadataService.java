package com.flowerguys.localpiece.domain.ai.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.exif.GpsDirectory;
import com.flowerguys.localpiece.domain.ai.dto.ImageMetadataDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.ZoneId;
import java.util.Date;
import java.io.ByteArrayInputStream; // import 추가
import java.io.InputStream;

@Slf4j
@Service
public class MetadataService {

    public ImageMetadataDto extractMetadata(byte[] imageBytes, String originalFilename, String imageUrl) {
        ImageMetadataDto.ImageMetadataDtoBuilder builder = ImageMetadataDto.builder()
                .url(imageUrl)
                .filename(originalFilename);

        // try-with-resources 구문으로 InputStream을 안전하게 사용
        try (InputStream inputStream = new ByteArrayInputStream(imageBytes)) {
            Metadata metadata = ImageMetadataReader.readMetadata(inputStream);
            ExifSubIFDDirectory exifDir = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
            if (exifDir != null) {
                Date originalDate = exifDir.getDate(ExifSubIFDDirectory.TAG_DATETIME_ORIGINAL);
                if (originalDate != null) {
                    builder.timestamp(originalDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
                }
            }

            GpsDirectory gpsDir = metadata.getFirstDirectoryOfType(GpsDirectory.class);
            if (gpsDir != null && gpsDir.getGeoLocation() != null) {
                builder.latitude(gpsDir.getGeoLocation().getLatitude());
                builder.longitude(gpsDir.getGeoLocation().getLongitude());
            }
        } catch (Exception e) {
            // 메타데이터 추출 실패는 블로그 생성 실패로 이어지면 안 되므로, 경고 로그만 남기고 넘어갑니다.
            log.warn("메타데이터 추출 실패 (파일: {}): {}", originalFilename, e.getMessage());
        }

        return builder.build();
    }
}