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

@Slf4j
@Service
public class MetadataService {

    public ImageMetadataDto extractMetadata(MultipartFile file, String imageUrl) {
        ImageMetadataDto.ImageMetadataDtoBuilder builder = ImageMetadataDto.builder().url(imageUrl);

        try (InputStream inputStream = file.getInputStream()) {
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
            log.warn("메타데이터 추출 실패 (파일: {}): {}", file.getOriginalFilename(), e.getMessage());
        }
        return builder.build();
    }
}