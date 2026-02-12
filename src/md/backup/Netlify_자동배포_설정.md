# Netlify 자동 배포 설정 가이드

## 📋 개요

GitHub에 코드를 푸시하면 **자동으로 Netlify에 배포**되도록 설정하는 방법입니다.

---

## 🚀 Step-by-Step 가이드

### Step 1: Netlify 계정 생성 및 로그인

1. **Netlify 사이트 접속**: https://app.netlify.com
2. **Sign up** 클릭 (계정이 없는 경우)
   - **GitHub** 계정으로 가입 권장 (연동이 편함)
3. GitHub으로 로그인하면 자동으로 연동됨

---

### Step 2: 새 사이트 생성

#### 2-1. 사이트 추가
1. Netlify 대시보드에서 **"Add new site"** 버튼 클릭
2. 드롭다운에서 **"Import an existing project"** 선택

![Netlify Add Site](https://docs.netlify.com/images/add-new-site.png)

#### 2-2. Git Provider 선택
1. **"Deploy with GitHub"** 선택
2. GitHub 계정 인증 (처음인 경우)
   - "Authorize Netlify" 클릭
   - 비밀번호 입력

#### 2-3. 저장소 선택
1. **저장소 목록**에서 `stitch-habit-mon` 검색
2. 저장소 클릭

**⚠️ 저장소가 안 보이는 경우:**
- "Configure the Netlify app on GitHub" 클릭
- GitHub에서 접근 권한 설정
- "All repositories" 또는 "Only select repositories" 선택
- `stitch-habit-mon` 저장소 체크
- "Save" 클릭

---

### Step 3: 빌드 설정

#### 3-1. Site settings 확인

다음 정보를 확인/입력:

| 항목 | 값 | 설명 |
|------|-----|------|
| **Branch to deploy** | `main` | 배포할 브랜치 |
| **Build command** | `npm run build` | 빌드 명령어 |
| **Publish directory** | `dist` | 빌드 결과 폴더 |
| **Functions directory** | `netlify/functions` | 서버리스 함수 폴더 |

**자동 감지됨:**
- `netlify.toml` 파일이 있으면 자동으로 설정 적용됨 ✅

#### 3-2. 고급 설정 (선택사항)

**"Show advanced"** 클릭 후:

- **Environment variables**: (필요 시)
  - `.env` 파일이 Git에 포함되어 있으므로 **설정 불필요** ✅
  
- **Build hooks**: (나중에 설정 가능)

---

### Step 4: 배포 시작

1. **"Deploy site"** 버튼 클릭
2. 배포 진행 상황 확인
   - "Site deploy in progress" 메시지 표시
   - 실시간 로그 확인 가능

**배포 시간:** 약 1-3분

---

### Step 5: 배포 완료 확인

#### 5-1. 배포 성공 확인
```
✅ Site is live
```

#### 5-2. 사이트 URL 확인
- 자동 생성된 URL: `https://[random-name].netlify.app`
- 예: `https://cheerful-cupcake-123456.netlify.app`

#### 5-3. 사이트 접속 테스트
1. URL 클릭
2. 앱이 정상적으로 로드되는지 확인
3. 투자관리 메뉴 테스트

---

## ⚙️ 자동 배포 설정 확인

### 자동 배포가 활성화되었는지 확인:

1. Netlify 대시보드 → **Site settings** 탭
2. **Build & deploy** 섹션
3. **Continuous Deployment** 확인

**다음이 활성화되어야 함:**
- ✅ **Build settings**: `npm run build`
- ✅ **Deploy contexts**: Production branch (`main`)
- ✅ **Branch deploys**: All branches 또는 Production only

---

## 🧪 자동 배포 테스트

### 코드 변경 후 푸시해서 테스트:

```bash
# 1. 간단한 변경 (예: README.md 수정)
echo "# Test deployment" >> README.md

# 2. 커밋
git add README.md
git commit -m "Test: Netlify auto deploy"

# 3. 푸시
git push origin main
```

### Netlify에서 확인:

1. **Deploys** 탭 클릭
2. 새로운 배포가 자동으로 시작됨 확인
   - "Building" → "Deploy successful" 상태 변경
3. 배포 로그 확인

**자동 배포 성공!** 🎉

---

## 📊 배포 상태 모니터링

### Netlify 대시보드 - Deploys 탭

| 상태 | 의미 | 아이콘 |
|------|------|--------|
| **Building** | 빌드 진행 중 | 🔄 |
| **Published** | 배포 완료 | ✅ |
| **Failed** | 배포 실패 | ❌ |

### 배포 로그 확인:
1. 배포 항목 클릭
2. **"Deploy log"** 탭
3. 빌드 과정 상세 확인

---

## 🎨 사이트 이름 변경 (선택사항)

### 자동 생성된 이름을 의미있는 이름으로 변경:

1. **Site settings** → **General** → **Site details**
2. **Site name** 섹션에서 **"Change site name"** 클릭
3. 원하는 이름 입력 (예: `stitch-habit-tracker`)
4. **"Save"** 클릭

**새 URL:** `https://stitch-habit-tracker.netlify.app`

---

## 🌐 커스텀 도메인 설정 (선택사항)

### 본인 소유 도메인 연결:

1. **Domain settings** 탭
2. **"Add custom domain"** 클릭
3. 도메인 입력 (예: `myapp.com`)
4. DNS 설정 안내 따라하기
   - Netlify DNS 사용 또는
   - 기존 DNS에 CNAME 레코드 추가

---

## 🔔 배포 알림 설정 (선택사항)

### 배포 성공/실패 시 알림 받기:

1. **Site settings** → **Build & deploy** → **Deploy notifications**
2. **"Add notification"** 클릭
3. 알림 유형 선택:
   - **Email**: 이메일 알림
   - **Slack**: Slack 채널 알림
   - **Webhook**: 커스텀 웹훅
4. 이벤트 선택:
   - Deploy succeeded
   - Deploy failed
   - Deploy started

---

## ⚡ 빌드 성능 최적화

### 빌드 시간 단축 방법:

#### 1. 캐시 활용
```toml
# netlify.toml에 추가
[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--prefer-offline --no-audit"
```

#### 2. 빌드 플러그인 사용
```toml
[[plugins]]
  package = "@netlify/plugin-lighthouse"
```

#### 3. 필요없는 devDependencies 제거
```json
// package.json - dependencies만 설치
{
  "scripts": {
    "build": "npm ci --production=false && vite build"
  }
}
```

---

## 🔧 문제 해결

### 문제 1: 빌드 실패

**증상:** "Build failed" 상태

**해결:**
1. 배포 로그 확인
2. 로컬에서 `npm run build` 테스트
3. `package.json`의 dependencies 확인
4. Node.js 버전 확인 (`netlify.toml`에 명시)

### 문제 2: 404 에러

**증상:** 사이트는 뜨는데 페이지가 404

**원인:** SPA 라우팅 설정 누락

**해결:** `netlify.toml`에 리다이렉트 설정 확인
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 문제 3: Functions 작동 안 함

**원인:** Functions 경로 설정 오류

**해결:**
```toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

---

## 📋 체크리스트

### ✅ 설정 완료 확인
- [ ] GitHub 저장소와 Netlify 연동됨
- [ ] 빌드 설정 확인 (`npm run build`, `dist`)
- [ ] 첫 배포 성공
- [ ] 사이트 URL 접속 가능
- [ ] 투자관리 기능 정상 작동
- [ ] 자동 배포 테스트 완료

### ✅ 선택 사항
- [ ] 사이트 이름 변경
- [ ] 커스텀 도메인 설정
- [ ] 배포 알림 설정
- [ ] 빌드 최적화

---

## 🎯 다음 단계

### 배포 후 할 일:

1. **팀원과 URL 공유**
   ```
   프로덕션 URL: https://your-site.netlify.app
   ```

2. **배포 브랜치 전략 수립**
   - `main`: 프로덕션
   - `develop`: 개발 환경 (선택사항)
   - Preview Deploys: PR 별 미리보기

3. **모니터링 설정**
   - Netlify Analytics (유료)
   - Google Analytics 연동

4. **성능 측정**
   - Lighthouse 점수 확인
   - Core Web Vitals 모니터링

---

## 📚 추가 리소스

### Netlify 공식 문서:
- [Getting Started](https://docs.netlify.com/get-started/)
- [Continuous Deployment](https://docs.netlify.com/configure-builds/get-started/)
- [Functions](https://docs.netlify.com/functions/overview/)
- [Custom Domains](https://docs.netlify.com/domains-https/custom-domains/)

### 유용한 Netlify 플러그인:
- `@netlify/plugin-lighthouse`: 성능 측정
- `netlify-plugin-cache`: 빌드 캐싱
- `netlify-plugin-checklinks`: 깨진 링크 확인

---

## 🎉 완료!

이제 GitHub에 푸시할 때마다 자동으로 Netlify에 배포됩니다!

```bash
git add .
git commit -m "Add new feature"
git push origin main
```

→ **자동으로 Netlify에 배포 시작** 🚀

---

**문제가 발생하면:**
1. Netlify 대시보드의 Deploy log 확인
2. [Netlify Support](https://answers.netlify.com/) 검색
3. GitHub Issues에 문의
