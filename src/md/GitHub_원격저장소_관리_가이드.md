# GitHub **원격 저장소** 관리 운영 가이드

이 문서는 **로컬 개발 환경**에서 GitHub 원격 저장소(`origin`)를 효율적으로 관리하고 코드를 동기화하기 위한 표준 절차를 기술합니다.

## 1. 저장소 연결 상태 확인

작업을 시작하기 전, 현재 연결된 원격 저장소 정보를 확인합니다.

```bash
# 원격 저장소 URL 확인
git remote -v
# 출력 예시:
# origin  https://github.com/iam1000/stitch-habit-mon.git (fetch)
# origin  https://github.com/iam1000/stitch-habit-mon.git (push)

# 현재 브랜치 및 파일 상태 확인
git status
```

## 2. 코드 변경 사항 반영 (업로드) 과정

로컬에서 작업한 내용을 GitHub 원격 저장소에 반영하는 3단계 절차입니다.

### 2.1 변경할 파일 선택 (Staging)
작업한 파일들을 커밋 대기 상태(Staging Area)로 올립니다.

```bash
# 변경된 모든 파일 추가
git add .

# 특정 파일만 추가할 경우
# git add src/App.jsx
```

### 2.2 커밋 생성 (Commit)
변경 사항을 하나의 작업 단위로 묶어 기록합니다. 메시지는 명확하게 작성합니다.

```bash
git commit -m "작업 내용을 명확하게 요약한 메시지"
```

### 2.3 원격 저장소로 내보내기 (Push)
커밋된 내역을 GitHub 서버로 전송합니다.

```bash
# 기본 업로드 (이미 upstream이 설정된 경우)
git push

# 처음 업로드하거나 업스트림 설정이 필요한 경우
git push -u origin main
```

---

## 3. 원격 저장소 내용 가져오기 (동기화)

다른 곳에서 수정된 내용이 있거나 협업 시, 원격 저장소의 최신 내용을 로컬로 가져옵니다.

```bash
# 원격 저장소의 변경 사항을 가져와 현재 브랜치에 병합
git pull origin main
```

## 4. 트러블슈팅

### 4.1 인증 실패 (Authentication failed)
`git push` 시 인증 오류가 발생할 경우:
- GitHub는 패스워드 인증을 지원하지 않습니다.
- **Personal Access Token(PAT)**을 발급받아 패스워드 대신 사용하거나, SSH 키를 등록해야 합니다.

### 4.2 병합 충돌 (Merge Conflict)
`git pull` 시 로컬 변경 사항과 원격 변경 사항이 겹칠 경우 발생합니다.
1. 충돌이 발생한 파일을 에디터로 엽니다.
2. `<<<<<<<`, `=======`, `>>>>>>>` 표시를 찾아 내용을 수정합니다.
3. 수정 완료 후 다시 `git add .` -> `git commit` -> `git push`를 진행합니다.
