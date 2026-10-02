# 별빛 타로 리딩 — 한 저장소 구성

이 저장소 하나에서 GitHub Pages 배포와 Notion 저장 Action을 함께 실행합니다.

## 처음 한 번 설정
1. 이 폴더의 내용물을 `pbosoo2/tarot-oracle` 저장소 루트에 업로드합니다.
2. 저장소 **Settings → General → Features**에서 **Issues**를 켭니다.
3. **Settings → Secrets and variables → Actions → New repository secret**을 선택합니다.
4. 이름 `NOTION_TOKEN`으로 Notion 개인 액세스 토큰을 저장합니다.
5. 토큰에 Notion API 쓰기 권한이 있고 `타로카드_new` 데이터베이스에 접근할 수 있어야 합니다.
6. **Settings → Pages → Build and deployment → Source**에서 **GitHub Actions**를 선택합니다.

## 저장 흐름
리딩 완료 → GitHub에서 저장 확인 → Submit new issue → Action이 Notion 저장 → Issue 본문 삭제 → Issue 닫기.

## 공개 저장소 주의
Issue는 Action이 처리하기 전 잠깐 공개될 수 있습니다. Action은 저장소 소유자가 만든 `[타로 저장]` Issue만 처리하며, 저장 후 본문을 자동으로 지웁니다.

## 파일
- `index.html`: 타로 페이지
- `.github/workflows/deploy-pages.yml`: Pages 자동 배포
- `.github/workflows/save-tarot-to-notion.yml`: Issue를 Notion에 저장
- `scripts/save-reading.mjs`: Notion API 저장 스크립트
