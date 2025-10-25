package com.flowerguys.localpiece.global.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource; // ClassPathResource 사용
import org.springframework.stereotype.Component;

import java.io.IOException; // IOException 추가
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections; // Collections 추가
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
public class SqliteUtil {

    private final String dbUrl;

    // 생성자에서 DB 경로를 설정합니다. application.yml 설정이 없으면 기본값 사용
    public SqliteUtil(@Value("${sqlite.db.path:classpath:db/gyeongsangbuk_do.db}") String dbPath) {
        String finalDbPath;
        if (dbPath.startsWith("classpath:")) {
            try {
                // ClassPathResource를 사용하여 resources 폴더 내 파일 경로를 안전하게 가져옴
                finalDbPath = new ClassPathResource(dbPath.substring(10)).getFile().getAbsolutePath();
            } catch (IOException e) {
                log.error("SQLite DB 파일을 찾을 수 없습니다: {}", dbPath, e);
                throw new RuntimeException("SQLite DB 파일 경로 오류: " + dbPath, e);
            }
        } else {
             finalDbPath = dbPath; // 직접 파일 경로 사용
        }

        this.dbUrl = "jdbc:sqlite:" + finalDbPath;
        log.info("SQLite DB 연결 URL 설정 완료: {}", this.dbUrl);

        // JDBC 드라이버 로드
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
             log.error("SQLite JDBC 드라이버 로딩 실패.", e);
             throw new RuntimeException("SQLite JDBC Driver not found", e);
        }
    }

    /**
     * 여러 contentId에 해당하는 category의 top_parent_code (contentTypeId)를 조회합니다.
     * @param contentIds 조회할 tourism_id (contentId) 세트
     * @return Map<Integer, String> 형태 (Key: contentId, Value: topParentCode)
     */
    public Map<Integer, String> findContentTypeIds(Set<Integer> contentIds) {
        // contentIds가 비어있으면 빈 Map 반환
        if (contentIds == null || contentIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<Integer, String> contentTypeMap = new HashMap<>();

        // contentId 목록을 PreparedStatement의 IN 절 파라미터로 사용하기 위한 문자열 생성 (?, ?, ?)
        String placeholders = contentIds.stream()
                                      .map(id -> "?")
                                      .collect(Collectors.joining(", "));

        // tourism 테이블과 category 테이블을 조인하여 tourism_id와 top_parent_code를 조회
        String sql = String.format(
            "SELECT t.content_id, c.top_parent_code " +
            "FROM tourism t JOIN category c ON t.category_id = c.category_id " +
            "WHERE t.content_id IN (%s)", placeholders
        );

        log.debug("Executing SQLite Query: {}", sql); // 쿼리 로그 추가 (디버깅용)

        try (Connection conn = DriverManager.getConnection(dbUrl);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            // PreparedStatement에 contentId 파라미터 설정
            int index = 1;
            for (Integer id : contentIds) {
                pstmt.setInt(index++, id);
            }

            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    int contentId = rs.getInt("content_id"); // DB 컬럼명 확인!
                    String topParentCode = rs.getString("top_parent_code"); // DB 컬럼명 확인!
                    if (topParentCode != null) {
                        contentTypeMap.put(contentId, topParentCode);
                    }
                }
                log.debug("SQLite Query Result Size: {}", contentTypeMap.size()); // 결과 개수 로그
            }
        } catch (SQLException e) {
            log.error("SQLite 조회 중 오류 발생 (ContentTypeId 조회): {}", e.getMessage(), e);
            // 운영 환경에서는 단순히 로깅만 할지, 아니면 예외를 던질지 결정 필요
            // throw new RuntimeException("SQLite 조회 오류", e);
        }
        return contentTypeMap;
    }
}