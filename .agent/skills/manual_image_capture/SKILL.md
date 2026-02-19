---
name: manual_image_capture
description: 캡처 자동화 도구를 실행하여, 사용자 매뉴얼 작성에 필요한 주요 화면(투자관리, 기준정보 등)의 스크린샷을 자동으로 확보합니다. (로그인은 사용자가 수동으로 수행해야 함)
---

# 매뉴얼 이미지 자동 캡처 (Manual Image Capture)

이 스킬은 Puppeteer를 사용하여 웹 애플리케이션의 주요 화면을 자동으로 순회하며 스크린샷을 캡처합니다.
캡처된 이미지는 `src/md/images` 폴더에 저장되며, 사용자 매뉴얼 작성 시 활용됩니다.

## ⚠️ 중요: 사용 전 확인사항
1.  **로컬 서버 실행:** `npm run dev` 명령어로 개발 서버가 `http://localhost:5173`에서 실행 중이어야 합니다.
2.  **로그인 필요:** 스크립트 실행 후 브라우저 창이 뜨면, **사용자가 직접 로그인을 수행**해야 합니다. 로그인이 완료되면 자동으로 캡처가 시작됩니다.

## 🚀 사용 방법

다음 명령어를 실행하여 캡처를 시작합니다.

```bash
# 스킬 스크립트 실행 (Node.js 필요)
node .agent/skills/manual_image_capture/scripts/index.js
```

## 📸 캡처 대상 (Scenarios)

스크립트는 다음 순서대로 화면을 캡처합니다:

### 1. 투자관리 (Investment)
*   투자내역 조회 (`01_investment_list_mockup.png`)
*   투자항목 추가 (`02_add_investment_form_mockup.png`)
*   계좌 관리 (`03_account_management_mockup.png`)
*   연동 설정 (`04_connection_settings_mockup.png`)

### 2. 기준정보관리 (Master Data)
*   공통 코드 관리 (`01_code_management_mockup.png`)
*   메뉴 관리 (`02_menu_management_mockup.png`)
*   권한 관리 (`03_permission_management_mockup.png`)

## 📂 결과물 위치
*   `src/md/images/` 디렉토리에 PNG 파일로 저장됩니다.
