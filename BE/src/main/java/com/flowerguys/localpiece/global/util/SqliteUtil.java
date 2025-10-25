package com.flowerguys.localpiece.global.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
public class SqliteUtil {

    private String dbUrl;
    private static boolean driverLoaded = false;

    static {
        try {
            Class.forName("org.sqlite.JDBC");
            driverLoaded = true;
            log.info("SQLite JDBC Driver loaded successfully via static block.");
        } catch (ClassNotFoundException e) {
            log.error("FATAL: SQLite JDBC 드라이버를 찾을 수 없습니다. 의존성이 올바르게 추가되었는지 확인하세요.", e);
        }
    }

    public SqliteUtil(@Value("${sqlite.db.path:classpath:db/gyeongsangbuk_do.db}") String dbPath) {
        if (!driverLoaded) {
             throw new RuntimeException("SQLite JDBC Driver was not loaded.");
        }
        File tempDbFile = null; // 임시 파일 참조 변수
        try {
            String resolvedPath;
            if (dbPath.startsWith("classpath:")) {
                String resourcePath = dbPath.substring(10);
                ClassPathResource resource = new ClassPathResource(resourcePath);

                if (!resource.exists()) {
                    throw new IOException("Classpath resource not found: " + resourcePath);
                }

                // 1. InputStream으로 리소스 직접 얻기 (경로 변환 X)
                try (InputStream inputStream = resource.getInputStream()) {
                    if (inputStream == null) {
                        throw new IOException("Could not get InputStream for resource: " + resourcePath);
                    }

                    // 2. 임시 파일 생성
                    tempDbFile = File.createTempFile("sqlite-db-", ".db", new File("/tmp")); // /tmp 디렉토리에 생성
                    tempDbFile.deleteOnExit(); // JVM 종료 시 자동 삭제

                    // 3. InputStream -> 임시 파일 복사
                    try (FileOutputStream outputStream = new FileOutputStream(tempDbFile)) {
                        FileCopyUtils.copy(inputStream, outputStream);
                    }
                    resolvedPath = tempDbFile.getAbsolutePath();
                    log.info("SQLite DB resource '{}' copied to temporary file: {}", resourcePath, resolvedPath);
                }

            } else {
                // classpath: 접두사가 없으면 외부 파일 시스템 경로로 간주
                File dbFile = new File(dbPath);
                if (!dbFile.exists()) {
                    throw new IOException("SQLite DB file not found at external path: " + dbPath);
                }
                resolvedPath = dbFile.getAbsolutePath();
                log.info("Using external SQLite DB file: {}", resolvedPath);
            }

            this.dbUrl = "jdbc:sqlite:" + resolvedPath;
            log.info("SQLite DB URL set to: {}", this.dbUrl);

        } catch (IOException e) {
            log.error("FATAL: SQLite DB 파일 처리 중 오류 발생: {}", dbPath, e);
            // 임시 파일 생성 실패 시 정리
            if (tempDbFile != null && tempDbFile.exists()) {
                tempDbFile.delete();
            }
            throw new RuntimeException("SQLite DB 파일 처리 오류", e);
        } catch (Exception e) { // 그 외 예외 처리
             log.error("FATAL: SQLiteUtil 생성 중 예상치 못한 오류 발생: {}", dbPath, e);
             if (tempDbFile != null && tempDbFile.exists()) {
                 tempDbFile.delete();
             }
             throw new RuntimeException("SQLiteUtil 생성 오류", e);
        }
    }

    // findContentTypeIds 메소드는 이전과 동일
    public Map<Integer, String> findContentTypeIds(Set<Integer> contentIds) {
        // ... (이전 코드와 동일) ...
        if (contentIds == null || contentIds.isEmpty()) {
            log.warn("findContentTypeIds called with empty or null contentIds set.");
            return Collections.emptyMap();
        }
        Map<Integer, String> contentTypeMap = new HashMap<>();
        String placeholders = String.join(",", Collections.nCopies(contentIds.size(), "?"));
        String sql = String.format(
            "SELECT t.content_id, c.top_parent_code " +
            "FROM tourism t LEFT JOIN category c ON t.category_id = c.category_id " +
            "WHERE t.content_id IN (%s)", placeholders);

        log.debug("Executing SQLite query: {}", sql);
        log.debug("Querying with content IDs: {}", contentIds);
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        try {
            conn = DriverManager.getConnection(dbUrl);
            pstmt = conn.prepareStatement(sql);
            int index = 1;
            for (Integer id : contentIds) {
                if (id != null) {
                   pstmt.setInt(index++, id);
                } else {
                   log.warn("Null contentId encountered in the input set.");
                }
            }
             if (index -1 != contentIds.size()) {
                  log.error("Parameter count mismatch after handling null IDs. Expected {}, got {}", contentIds.size(), index -1);
                  // 임시방편으로 빈 맵 반환, 실제로는 예외처리 고려
                  return Collections.emptyMap();
             }
            rs = pstmt.executeQuery();
            int foundCount = 0;
            while (rs.next()) {
                foundCount++;
                int contentIdResult = rs.getInt("content_id");
                String topParentCode = rs.getString("top_parent_code");
                if (topParentCode != null) {
                    contentTypeMap.put(contentIdResult, topParentCode);
                    log.debug("Found mapping: contentId={} -> contentTypeId={}", contentIdResult, topParentCode);
                } else {
                    log.warn("Found contentId={} but its top_parent_code is NULL in category table.", contentIdResult);
                    contentTypeMap.put(contentIdResult, null);
                }
            }
            log.info("Query executed. Found {} mappings for {} input IDs.", foundCount, contentIds.size());
            contentIds.forEach(id -> {
                if (id != null && !contentTypeMap.containsKey(id)) {
                    log.warn("No data or category mapping found for contentId: {}", id);
                }
            });
        } catch (SQLException e) {
            log.error("SQLite 조회 중 심각한 오류 발생. DB URL: [{}], SQL: [{}]. Error: {}", dbUrl, sql, e.getMessage(), e);
        } finally {
            try { if (rs != null) rs.close(); } catch (SQLException e) { log.error("ResultSet closing error", e); }
            try { if (pstmt != null) pstmt.close(); } catch (SQLException e) { log.error("PreparedStatement closing error", e); }
            try { if (conn != null) conn.close(); } catch (SQLException e) { log.error("Connection closing error", e); }
        }
        return contentTypeMap;
    }
}