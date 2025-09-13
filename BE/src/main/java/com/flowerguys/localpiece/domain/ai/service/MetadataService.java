// 이미지 파일에서 EXIF 메타데이터를 추출하는 로직을 전담하는 서비스입니다.
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
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Slf4j
@Service
public class MetadataService {

    public ImageMetadataDto extractMetadata(MultipartFile file, String imageUrl) {
        ImageMetadataDto.ImageMetadataDtoBuilder builder = ImageMetadataDto.builder().url(imageUrl);

        try (InputStream inputStream = file.getInputStream()) {
            Metadata metadata = ImageMetadataReader.readMetadata(inputStream);

            // 1. 촬영 시간 정보 (Date/Time Original) 추출
            ExifSubIFDDirectory exifDir = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
            if (exifDir != null) {
                Date originalDate = exifDir.getDate(ExifSubIFDDirectory.TAG_DATETIME_ORIGINAL);
                if (originalDate != null) {
                    builder.timestamp(originalDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
                }
            }

            // 2. GPS 위치 정보 추출
            GpsDirectory gpsDir = metadata.getFirstDirectoryOfType(GpsDirectory.class);
            if (gpsDir != null && gpsDir.getGeoLocation() != null) {
                builder.latitude(gpsDir.getGeoLocation().getLatitude());
                builder.longitude(gpsDir.getGeoLocation().getLongitude());
            }

        } catch (Exception e) {
            log.warn("이미지 메타데이터 추출 중 오류 발생 (파일: {}): {}", file.getOriginalFilename(), e.getMessage());
            // 메타데이터가 없거나 오류가 발생해도 URL은 그대로 반환합니다.
        }

        return builder.build();
    }
}
