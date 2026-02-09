# Git 히스토리에서 민감 정보 완전 제거 가이드

## ⚠️ 주의사항
- 이 작업은 Git 히스토리를 재작성합니다
- 다른 팀원이 있다면 조율 필요
- Force push가 필요합니다

## 🔧 해결 방법

### 1. BFG Repo-Cleaner 사용 (권장)

```bash
# BFG 설치 (Homebrew 사용)
brew install bfg

# 파일 삭제
bfg --delete-files antigravity-486713-ce0c8ed9a651.json

# Git 정리
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin main --force
```

### 2. git filter-repo 사용 (대안)

```bash
# git-filter-repo 설치
brew install git-filter-repo

# 파일 제거
git filter-repo --path src/md/antigravity-486713-ce0c8ed9a651.json --invert-paths

# Force push
git push origin main --force
```

### 3. Interactive Rebase 사용 (수동)

```bash
# 문제의 커밋 이전으로 rebase
git rebase -i 9360d48

# 편집기에서 55622a0 커밋을 'edit'으로 변경
# 파일 제거
git rm src/md/antigravity-486713-ce0c8ed9a651.json
git commit --amend --no-edit

# Rebase 계속
git rebase --continue

# Force push
git push origin main --force
```

## 🔐 보안 권장사항

1. **Service Account 재생성**
   - Google Cloud Console에서 기존 Service Account 삭제
   - 새로운 Service Account 생성
   - 새 키를 `.env` 파일에만 저장

2. **.env 파일도 Git에서 제외**
   ```bash
   git rm --cached .env
   ```

3. **.gitignore 업데이트**
   ```gitignore
   .env
   src/md/*.json
   ```

## ✅ 완료 후 확인

```bash
# 히스토리 확인
git log --all -- src/md/antigravity-486713-ce0c8ed9a651.json

# 결과가 없어야 함
```
