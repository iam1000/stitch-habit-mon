# 🚨 GitHub 권한 오류(403) 해결 가이드

현재 발생하는 오류(`Permission to ... denied to rnbsoft-sgerp`)는 컴퓨터에 저장된 **이전 GitHub 계정(`rnbsoft-sgerp`) 정보**가 자동으로 사용되면서, **현재 레포지토리 주인(`iam1000`)**의 저장소에 접근하지 못해 발생하는 문제입니다.

---

## 🛠️ 해결 방법 1: 윈도우 자격 증명 삭제 (가장 권장)

컴퓨터 안의 "이전 계정 로그인 정보"를 지우고, 새 계정으로 다시 로그인하여 해결합니다.

1.  키보드의 **[Windows 키]**를 누르고 **"자격 증명 관리자"** (또는 *Credential Manager*)를 검색하여 실행합니다.
2.  **[Windows 자격 증명]** 탭을 클릭합니다.
3.  목록에서 `git:https://github.com` 으로 시작하는 항목을 찾습니다.
4.  해당 항목을 클릭하고 **[제거]** 버튼을 눌러 삭제합니다.
5.  다시 터미널로 돌아와서 `git push -u origin main` 명령어를 입력합니다.
6.  GitHub 로그인 창이 새로 뜨면 **`iam1000`** 계정으로 로그인을 진행합니다.

---

## 🛠️ 해결 방법 2: 리모트 주소에 아이디 강제 지정 (임시 해결)

저장소 주소 자체에 아이디를 박아넣어 강제로 해당 아이디로 인증하게 하는 방법입니다.

1.  터미널에 아래 명령어를 입력합니다.
    ```bash
    git remote set-url origin https://iam1000@github.com/iam1000/stitch-habit-mon.git
    ```
2.  다시 `git push -u origin main`을 시도하면 비밀번호(또는 토큰)를 묻는 창이 뜰 수 있습니다.

---

## 💡 참고: 커밋 작성자 이름 변경
만약 GitHub에 올라가는 커밋 작성자 이름도 `rnbsoft-sgerp`가 아닌 `iam1000` 등으로 바꾸고 싶다면, 아래 명령어로 현재 프로젝트 설정을 변경하세요.

```bash
git config user.name "Your Name"
git config user.email "your_email@example.com"
```
