from datetime import datetime
from typing import List, Tuple
from app.models import ImageMetadataDto
from app.config import MAX_PHOTOS_LIMIT

def prepare_data(images: List[ImageMetadataDto]) -> Tuple[List[ImageMetadataDto], List[ImageMetadataDto]]:
    """
    입력된 이미지 데이터를 전처리합니다. (개수 제한, 시간순 정렬, 분리)
    """
    # 1. 성능과 안정성을 위해 처리할 사진 개수를 제한합니다.
    selected_images = images[:MAX_PHOTOS_LIMIT]

    # 2. 시간 정보(timestamp) 유무에 따라 사진들을 두 그룹으로 나눕니다.
    images_with_ts = [img for img in selected_images if img.timestamp]
    images_without_ts = [img for img in selected_images if not img.timestamp]

    # 3. 시간 정보가 있는 사진들을 촬영된 순서대로 정렬합니다.
    try:
        images_with_ts.sort(key=lambda img: datetime.fromisoformat(img.timestamp))
    except ValueError:
        # 타임스탬프 형식이 잘못된 경우, 에러를 방지하기 위해 모두 '순서 없는 사진'으로 처리
        print("WARNING: 잘못된 형식의 timestamp가 있어 정렬에 실패했습니다. 모든 사진을 순서 없는 사진으로 처리합니다.")
        images_without_ts.extend(images_with_ts)
        images_with_ts = []

    return images_with_ts, images_without_ts