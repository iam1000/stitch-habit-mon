# NotebookLM MCP 설치 및 관리 가이드

이 문서는 Google NotebookLM을 AI 에이전트(예: Antigravity, Claude, Cursor)와 연결하여 사용할 수 있도록 도와주는 **NotebookLM MCP 서버**의 설치, 업그레이드, 재설치 및 관리 방법을 초보자도 쉽게 따라 할 수 있도록 안내합니다.

> **참고:** 이 가이드는 **Windows(PowerShell)** 및 **Mac(Terminal/Zsh)** 환경을 모두 포함합니다. 또한, 빠르고 효율적인 Python 패키지 관리 도구인 **`uv`** 사용을 권장합니다.

---

## 0. 설치 가이드 비교 및 참고 URL

NotebookLM MCP를 설치할 때 참고할 수 있는 두 가지 주요 소스가 있습니다.

### 1) [공식 원본 리포지토리 (추천)](https://github.com/PleasePrompto/notebooklm-mcp)
*   **특징**: 가장 최신의 기능과 패키지 정보가 반영됩니다.
*   **패키지명**: `notebooklm-mcp` (최신 통합 버전)
*   **권장 대상**: 안정적인 최신 기능을 사용하고 싶은 분, 기술적인 문제 해결이 필요한 분.

### 2) [한국어 가이드 / 포크 (참고용)](https://github.com/wonseokjung/notebooklm-mcp)
*   **특징**: 한국어 설명과 활용 사례(콘텐츠 수익화 등)가 포함되어 있습니다.
*   **패키지명**: 문서에 따라 `notebooklm-mcp-server` (구버전) 등의 이름이 혼용될 수 있습니다.
*   **권장 대상**: NotebookLM의 활용 아이디어를 얻거나, 한글로 된 대략적인 개요를 보고 싶은 분.

**결론**: 설치 및 기술적인 관리는 **이 문서(또는 공식 리포지토리)**를 따르고, 활용법은 **한국어 가이드**를 참고하는 것이 좋습니다.

---

## 1. 사전 준비 (uv 설치)

NotebookLM MCP를 설치하기 전에 `uv`가 설치되어 있어야 합니다. `uv`는 Python 도구를 아주 쉽고 빠르게 설치하고 실행할 수 있게 해줍니다.

**설치 확인:**
터미널(PowerShell)을 열고 다음 명령어를 입력해 보세요.
```powershell
uv --version
```
버전 정보가 나오면 이미 설치된 것입니다. 오류가 난다면 아래 명령어로 설치하세요.

**uv 설치 명령어 (Windows):**
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**uv 설치 명령어 (Mac):**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```
*   설치 후에는 터미널을 껐다가 다시 켜야 적용될 수 있습니다.

---

## 2. NotebookLM MCP 설치하기 (최초 설치)

처음 NotebookLM MCP를 사용하려 한다면 다음 단계를 따라주세요.

### 2.1. 설치 명령어 실행
터미널에서 아래 명령어를 복사하여 붙여넣고 엔터키를 누르세요.

```powershell
uv tool install notebooklm-mcp
```
*   잠시 기다리면 설치가 완료되었다는 메시지가 뜹니다.

### 2.2. 인증 (로그인)
설치 후 반드시 **최초 1회 인증**을 해야 합니다.

1.  터미널에 다음 명령어를 입력합니다.
    ```powershell
    notebooklm-mcp-auth
    ```
2.  Chrome 브라우저 창이 자동으로 열립니다.
3.  사용하려는 **Google 계정**으로 로그인합니다.
4.  로그인이 완료되면 브라우저 창을 닫고 터미널로 돌아옵니다.

이제 설치와 인증이 모두 완료되었습니다!

---

## 3. 최신 버전으로 업그레이드하기

새로운 기능이 추가되거나 버그가 수정되었을 때, 최신 버전으로 업데이트하는 방법입니다.

```powershell
uv tool upgrade notebooklm-mcp
```
*   이미 최신 버전이라면 "Nothing to upgrade" 같은 메시지가 나옵니다.
*   업데이트가 진행되면 새로운 버전이 설치됩니다.

---

## 4. 재설치 방법 (문제 해결 또는 패키지명 변경 시)

설치된 프로그램이 꼬였거나, 예전 패키지(`notebooklm-mcp-server`)에서 새 패키지(`notebooklm-mcp`)로 갈아타야 할 때 사용합니다.

### 4.1. 기존 버전 삭제
먼저 설치된 것을 깔끔하게 지웁니다.
```powershell
# 기존 패키지명(notebooklm-mcp-server 등)을 알고 있다면 해당 이름을 사용
uv tool uninstall notebooklm-mcp-server
# 또는
uv tool uninstall notebooklm-mcp
```

### 4.2. 새로 설치
삭제가 완료되면 다시 설치 명령어를 실행합니다.
```powershell
uv tool install notebooklm-mcp
```

### 4.3. 재인증 (필수)
재설치 후에는 인증 정보를 다시 등록하는 것이 좋습니다.
```powershell
notebooklm-mcp-auth
```

---

## 5. MCP 서버 관리 및 유용한 명령어

`uv`를 사용하여 설치된 도구들을 관리하는 명령어들입니다.

| 작업 | 명령어 | 설명 |
| :--- | :--- | :--- |
| **설치된 도구 목록 보기** | `uv tool list` | 현재 설치된 모든 도구의 이름과 버전을 확인합니다. |
| **특정 도구 정보 확인** | `uv tool show notebooklm-mcp` | 설치 경로, 실행 파일 위치 등 상세 정보를 봅니다. |
| **모든 도구 업그레이드** | `uv tool upgrade --all` | 설치된 모든 도구를 한 번에 최신 버전으로 업데이트합니다. |
| **캐시 정리** | `uv cache clean` | 설치 과정에서 쌓인 임시 파일들을 정리하여 용량을 확보합니다. |
| **MCP 서버 업데이트 확인** | `uv tool upgrade notebooklm-mcp --dry-run` | 실제로 업데이트하지 않고, 업데이트할 버전이 있는지 확인만 합니다. (지원 시) |


### 💡 팁: 도구 이름이 헷갈릴 때
`uv tool list` 명령어를 입력하면 현재 내 컴퓨터에 `notebooklm-mcp`로 설치되어 있는지, `notebooklm-mcp-server`로 설치되어 있는지 정확한 이름을 알 수 있습니다.

---

## 6. 설치/업그레이드 후 필수 확인 사항 (중요)

새로운 버전을 설치하거나 재설치했다면 다음 사항들을 꼭 확인하세요.

1.  **실행 파일 경로 확인**:
    *   터미널에서 `where.exe notebooklm-mcp` (Win) 또는 `which notebooklm-mcp` (Mac) 명령어로 실제 설치된 경로를 확인합니다.
    *   AI 에이전트 설정 파일(`mcp_config.json`)에 적힌 경로와 일치하는지 비교하고, 다르면 수정해야 합니다.

2.  **재인증 (로그인)**:
    *   버전이 크게 바뀌면 인증 정보 저장 방식이 달라질 수 있습니다.
    *   `notebooklm-mcp-auth` 명령어를 실행하여 다시 한번 로그인하는 것을 강력히 권장합니다.

3.  **AI 도구 재시작**:
    *   설정을 변경하거나 프로그램을 새로 설치했다면, Antigravity나 Claude Desktop 같은 AI 도구를 **완전히 종료 후 다시 시작**해야 합니다.

---

## 7. Antigravity 설정 (참고)

Antigravity(또는 다른 AI 에이전트) 설정 파일(`mcp_config.json`)에는 보통 다음과 같이 등록됩니다. `uv`는 실행 파일(shim)을 한 곳에서 관리하므로, 재설치하더라도 경로나 설정은 그대로 유지되는 경우가 많습니다.

**설정 예시 (`mcp_config.json`):**
```json
"notebooklm-mcp": {
  "command": "notebooklm-mcp",
  "args": [],
  "disabled": false,
  "autoApprove": []
}
```
*   `command`에 전체 경로를 적어줘야 할 수도 있습니다. `uv`가 관리하는 경로는 다음과 같이 확인할 수 있습니다.
    *   **Windows**: `where.exe notebooklm-mcp`
    *   **Mac**: `which notebooklm-mcp`

