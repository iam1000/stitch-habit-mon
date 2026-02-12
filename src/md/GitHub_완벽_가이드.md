# GitHub 완벽 가이드 (The Complete GitHub Guide)

> **문서 개요**: Git 설치부터 프로젝트 연동, 협업 워크플로우, 그리고 트러블슈팅까지의 모든 과정을 담은 통합 가이드입니다.  
> **대상**: Git을 처음 접하는 초심자부터, 능숙하게 형상 관리를 하고 싶은 개발자  
> **최신 업데이트**: 2026-02-12

---

## 📋 목차
1. [시작하기 (Getting Started)](#1-시작하기-getting-started)
2. [프로젝트 초기 설정 (Repository Setup)](#2-프로젝트-초기-설정-repository-setup)
3. [기본 워크플로우 (Basic Workflow)](#3-기본-워크플로우-basic-workflow)
4. [협업 및 동기화 (Collaboration)](#4-협업-및-동기화-collaboration)
5. [트러블슈팅 (Troubleshooting)](#5-트러블슈팅-troubleshooting)

---

## 1. 시작하기 (Getting Started)

### 1.1 Git 설치

#### 🍏 Mac (macOS)
Mac에서는 Homebrew를 사용하여 설치하는 것이 가장 편리합니다.
1. 터미널(Terminal) 실행
2. Homebrew 설치 (없는 경우):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
3. Git 설치:
   ```bash
   brew install git
   ```

#### 🪟 Windows
1. [Git 공식 홈페이지](https://git-scm.com/download/win) 접속
2. 설치 프로그램 다운로드 및 실행 (설정은 대부분 'Next'로 진행)
3. 설치 확인: 터미널(PowerShell)에서 `git --version` 입력

### 1.2 사용자 정보 설정 (최초 1회)
커밋 기록에 남을 이름과 이메일을 설정합니다.
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 2. 프로젝트 초기 설정 (Repository Setup)

### 2.1 로컬 저장소 만들기
새 프로젝트 폴더에서 Git을 시작합니다.
```bash
cd c:\my-project
git init
```
이 명령을 실행하면 `.git` 숨김 폴더가 생성되며, Git이 파일 변경사항을 추적하기 시작합니다.

### 2.2 무시할 파일 설정 (.gitignore) **✨ 중요!**
보안상 업로드하면 안 되는 파일(`node_modules`, `.env`, API Key 등)을 지정합니다.
프로젝트 루트에 `.gitignore` 파일을 만들고 아래 내용을 작성하세요.

```text
# Dependencies
node_modules/
dist/

# Security (절대 업로드 금지)
.env
.DS_Store
*.json  # 서비스 계정 키 파일 등
```

### 2.3 원격 저장소 연결
GitHub 웹사이트에서 새 리포지토리(Repository)를 생성한 후, 로컬과 연결합니다.

```bash
# 원격 저장소 주소 추가 (별칭: origin)
git remote add origin https://github.com/username/repository-name.git

# 연결 확인
git remote -v
```

---

## 3. 기본 워크플로우 (Basic Workflow)

코드를 수정하고 저장하는 반복적인 과정입니다.

### 3.1 상태 확인 (Status)
현재 어떤 파일이 수정되었는지 확인합니다.
```bash
git status
```

### 3.2 파일 담기 (Staging)
수정된 파일을 커밋 대기 상태(Stage)로 올립니다.
```bash
# 모든 변경사항 추가
git add .

# 특정 파일만 추가
git add src/App.jsx
```

### 3.3 커밋 (Commit)
작업 내용을 하나의 단위로 확정하고 메시지를 남깁니다.
```bash
git commit -m "기능 추가: 로그인 페이지 디자인 수정"
```

### 3.4 업로드 (Push)
내 컴퓨터의 커밋 내역을 GitHub 서버로 보냅니다.
```bash
# 최초 업로드 시 (업스트림 설정)
git push -u origin main

# 이후 업로드 시
git push
```

---

## 4. 협업 및 동기화 (Collaboration)

### 4.1 최신 코드 가져오기 (Pull)
다른 팀원이 올린 코드를 내 컴퓨터로 가져와 합칩니다.
```bash
git pull origin main
```
> **Tip**: 작업 시작 전에 항상 `git pull`을 먼저 하는 습관을 들이세요!

### 4.2 변경 사항 확인만 하기 (Fetch & Diff)
합치기 전에 어떤 내용이 바뀌었는지 미리 확인합니다.
```bash
# 변경 내역 가져오기 (파일은 안 바뀜)
git fetch

# 내 코드와 원격 코드 비교
git diff HEAD origin/main
```

### 4.3 충돌 해결 (Merge Conflict)
같은 파일의 같은 라인을 서로 다르게 수정했을 때 발생합니다.
1. 에디터에서 충돌 파일 열기 (`<<<<<<<`, `=======`, `>>>>>>>` 표시 확인)
2. 원하는 코드로 수정하고 저장
3. 다시 `git add .` -> `git commit` -> `git push`

---

## 5. 트러블슈팅 (Troubleshooting)

### Q1. "Permission denied (403)" 또는 인증 오류
이전 계정 정보가 컴퓨터에 남아있어 발생하는 문제입니다.

**해결 (Windows):**
1. [제어판] -> [자격 증명 관리자] 실행
2. [Windows 자격 증명] 탭 클릭
3. `git:https://github.com` 항목 찾아서 **제거**
4. 다시 `git push` 하면 로그인 창이 뜹니다.

### Q2. `.env` 파일이나 API Key를 실수로 올렸어요!
**절 대** 그냥 `rm`으로 지우고 커밋하면 안 됩니다. 히스토리에 남아서 조회가 가능합니다.

**방법 1: BFG Repo-Cleaner 사용 (권장)**
```bash
# 1. 파일 삭제 및 히스토리 정리
bfg --delete-files .env

# 2. Git 가비지 컬렉터 실행
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 3. 강제 푸시
git push origin main --force
```

**방법 2: 수동 정리 (파일이 적을 때)**
```bash
# Git 캐시에서 제거 (로컬 파일은 유지됨)
git rm --cached .env

# 설정 추가
echo ".env" >> .gitignore

# 커밋 및 푸시
git commit -m "Remove sensitive file"
git push
```
*(주의: 이 방법은 이전 커밋 기록에서는 파일 내용을 볼 수 있습니다. Key를 재발급 받는 것이 가장 안전합니다.)*

### Q3. "refusing to merge unrelated histories" 오류
로컬 저장소와 원격 저장소가 서로 다른 시점에 만들어져서 병합을 거부하는 경우입니다.
```bash
git pull origin main --allow-unrelated-histories
```
옵션을 주어서 강제로 병합할 수 있습니다.

---

**관련 명령어 요약표**

| 명령어 | 설명 |
| :--- | :--- |
| `git init` | 저장소 초기화 |
| `git status` | 파일 상태 확인 |
| `git add .` | 전체 파일 스테이징 |
| `git commit -m "msg"` | 커밋 생성 |
| `git push` | 원격 저장소 업로드 |
| `git pull` | 원격 저장소 내용 가져오기 |
| `git log` | 커밋 히스토리 조회 |
| `git remote -v` | 연결된 원격 저장소 확인 |
