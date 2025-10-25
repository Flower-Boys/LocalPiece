package com.flowerguys.localpiece.global.common.exception;

import com.flowerguys.localpiece.global.common.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // @Valid 유효성 검사 실패 시
    @ExceptionHandler(MethodArgumentNotValidException.class)
    protected ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        log.error("handleMethodArgumentNotValidException", e);

        BindingResult bindingResult = e.getBindingResult();
        // 여러 유효성 검사 오류 중 첫 번째 오류의 메시지를 가져옵니다.
        String errorMessage = bindingResult.getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse(ErrorCode.INVALID_ARGUMENT.getMessage());

        // ErrorResponse를 직접 생성하여 상세 메시지를 담아줍니다.
        final ErrorResponse response = new ErrorResponse(ErrorCode.INVALID_ARGUMENT, errorMessage);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    // 우리가 직접 정의한 비즈니스 예외 처리
    @ExceptionHandler(BusinessException.class)
    protected ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        log.error("handleBusinessException", e);
        final ErrorCode errorCode = e.getErrorCode();
        final ErrorResponse response = new ErrorResponse(errorCode);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    // Spring Security의 AccessDeniedException 처리 (권한 없음)
    @ExceptionHandler(AccessDeniedException.class)
    protected ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException e) {
        log.error("handleAccessDeniedException", e);
        final ErrorResponse response = new ErrorResponse(ErrorCode.ACCESS_DENIED);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    // 위에 정의되지 않은 모든 예외 처리
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<ErrorResponse> handleException(Exception e) {
        log.error("handleException", e);
        final ErrorResponse response = new ErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}