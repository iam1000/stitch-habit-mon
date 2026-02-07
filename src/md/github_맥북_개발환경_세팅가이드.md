# 💻 맥북(MacBook)에서 개발 환경 세팅 및 작업 이어하기 가이드

새로운 맥북에서 기존의 GitHub 레포지토리를 연결하여 작업을 이어서 하기 위한 절차입니다.

---

## 🚀 1. 필수 프로그램 설치 (Setup)

맥북에서는 터미널(Terminal)을 열고 **Homebrew**(패키지 관리자)를 사용하면 설치가 편리합니다.

1.  **Homebrew 설치** (이미 설치되어 있다면 패스)
    *   터미널을 열고 아래 명령어를 복사 붙여넣기 하여 설치합니다.
    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```

2.  **Node.js & Git 설치**
    ```bash
    brew install node git
    ```
    *   설치 후 `node -v`, `git --version` 으로 설치 확인.

3.  **VS Code 설치**
    *   [VS Code 공식 사이트](https://code.visualstudio.com/)에서 Mac용 버전을 다운로드하여 설치합니다.

---

## ⬇️ 2. 소스 코드 가져오기 (Clone)

원격 저장소(GitHub)에 올려둔 코드를 맥북으로 가져옵니다.

1.  **터미널에서 작업할 폴더로 이동**
    ```bash
    mkdir -p ~/Documents/AI_DEV  # 폴더 생성
    cd ~/Documents/AI_DEV        # 폴더 이동
    ```

2.  **GitHub 레포지토리 복제**
    ```bash
    git clone https://github.com/iam1000/stitch-habit-mon.git
    cd stitch-habit-mon
    ```

---

## ⚙️ 3. 환경 설정 (Config)

보안상 GitHub에 올리지 않은 설정 파일(`.env`)을 수동으로 복구해야 합니다.

1.  **VS Code 실행**
    ```bash
    code .
    ```

2.  **환경 변수 파일 생성**
    *   프로젝트 최상위 경로에 `.env` 파일을 생성합니다.
    *   기존 윈도우 PC에서 내용을 복사해오거나, Supabase 대시보드에서 키 값을 확인하여 입력합니다.
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    *(GitHub에는 이 파일이 없으므로 꼭 직접 만들어야 로그인이 작동합니다!)*

---

## 📦 4. 라이브러리 설치 (Install)

`package.json`에 명시된 라이브러리들을 일괄 설치합니다.

```bash
npm install
```

---

## ▶️ 5. 개발 서버 실행 (Run)

설치가 완료되면 개발 서버를 킵니다.

```bash
npm run dev
```
*   `http://localhost:5173` 주소가 뜨면 브라우저에서 접속하여 확인합니다.

---

## ✅ 요약 체크리스트
- [ ] Node.js, Git 설치됨
- [ ] `git clone`으로 소스 가져옴
- [ ] `.env` 파일 만들고 Supabase 키 입력함
- [ ] `npm install` 완료함
- [ ] `npm run dev` 로 실행 확인
