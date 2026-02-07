# 🐙 GitHub 소스 형상 관리 가이드

이 문서는 현재 작업 중인 `c:\AI_DEV\stitch` 프로젝트를 GitHub에 연동하여 소스 코드를 관리하기 위한 초기 설정부터 업로드(Push)까지의 절차를 안내합니다.

---

## 🚀 1. 사전 준비 (Prerequisites)

1.  **Git 설치 확인**: 컴퓨터에 Git이 설치되어 있어야 합니다.
    *   터미널에서 `git --version` 명령어를 입력하여 버전을 확인하세요.
2.  **GitHub 계정**: GitHub(https://github.com/) 계정이 있어야 합니다.
3.  **VS Code (권장)**: 터미널 작업이 익숙하지 않다면 VS Code의 소스 제어 탭을 활용하면 편리합니다.

---

## 📁 2. 프로젝트 초기 설정 (Local Repo)

프로젝트 폴더(`c:\AI_DEV\stitch`)에서 Git을 시작합니다.

1.  **Git 초기화 (Initialize)**
    ```bash
    cd c:\AI_DEV\stitch
    git init
    ```
    *   이 명령을 실행하면 숨겨진 폴더 `.git`이 생성되며, Git이 파일 변경 사항을 추적하기 시작합니다.

2.  **`.gitignore` 파일 생성 및 확인**
    *   Git에 올리지 않을 파일들(예: `node_modules`, `.env`, `dist` 등)을 정의합니다.
    *   프로젝트 루트에 `.gitignore` 파일이 있는지 확인하고, 없으면 생성 후 아래 내용을 추가하세요.
        ```
        node_modules/
        dist/
        .env
        .DS_Store
        ```

3.  **파일 스테이징 및 첫 커밋 (First Commit)**
    ```bash
    git add .
    git commit -m "Initial commit: Stitch project setup"
    ```
    *   `git add .`: 현재 폴더의 모든 변경 사항을 스테이지(무대)에 올립니다.
    *   `git commit`: 스테이지에 올라간 파일들을 "Initial commit"이라는 이름으로 저장(스냅샷)합니다.

---

## 🌐 3. GitHub 레포지토리 생성 (Remote Repo)

1.  GitHub 웹사이트(https://github.com/)에 로그인합니다.
2.  우측 상단의 **+** 버튼을 누르고 **New repository**를 클릭합니다.
3.  **Repository name**에 프로젝트 이름(예: `stitch-habit-mon`)을 입력합니다.
4.  **Public** (공개) 또는 **Private** (비공개)를 선택합니다.
5.  *Initialize this repository with...* (README 등) 옵션은 **체크하지 않습니다**. (이미 로컬에 코드가 있으므로)
6.  **Create repository** 버튼을 클릭합니다.

---

## 🔗 4. 로컬과 원격 연결 (Connect & Push)

GitHub 레포지토리가 생성되면, 화면에 나오는 커맨드 중 **"…or push an existing repository from the command line"** 부분을 참고합니다.

1.  **원격 저장소 주소 연결**
    ```bash
    git remote add origin https://github.com/사용자아이디/레포지토리이름.git
    ```
    *   (예시: `git remote add origin https://github.com/my-username/stitch-habit-mon.git`)

2.  **브랜치 이름 변경 (선택사항)**
    *   최근 GitHub 기본 브랜치는 `main`입니다. 로컬이 `master`라면 `main`으로 변경해줍니다.
    ```bash
    git branch -M main
    ```

3.  **소스 코드 업로드 (Push)**
    ```bash
    git push -u origin main
    ```
    *   첫 업로드 시 GitHub 로그인 창이 뜰 수 있습니다. 로그인해주시면 됩니다.

---

## 🔄 5. 이후 작업 절차 (Workflow)

코드를 수정한 후에는 다음 3단계를 반복하여 GitHub에 업데이트합니다.

1.  **작업 내용 저장**
    ```bash
    git add .
    ```
2.  **커밋 (기록 남기기)**
    ```bash
    git commit -m "기능 추가: 로그인 페이지 디자인 수정"
    ```
3.  **푸시 (GitHub에 올리기)**
    ```bash
    git push
    ```

---

## ✅ 요약

1.  `git init` (시작)
2.  `git add .` & `git commit` (저장)
3.  GitHub 레포지토리 생성
4.  `git remote add origin [URL]` (연결)
5.  `git push -u origin main` (업로드)
