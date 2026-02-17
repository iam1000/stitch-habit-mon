# 데이터 문서 작성 계획 (Data Documentation Plan)

본 문서는 현재 시스템의 데이터 구조를 체계화하고 향후 RDBMS 도입을 대비하기 위한 데이터 문서(DRD, DSD, ERD 등)의 작성 현황과 관리 체계를 정의합니다.

> **파일명 표준 규칙:** `DATA_[분류]_[상세내용]_[약어].md`

---

## 1. 아키텍처 및 핵심 설계 (DATA_ARCH)
시스템의 데이터 구조와 흐름을 정의하는 핵심 산출물입니다.

### 📋 주요 문서
1.  **[DATA_ARCH_요구사항정의서_DRD.md](./DATA_ARCH_요구사항정의서_DRD.md)**
    *   **목적:** 비즈니스 로직에 필요한 데이터의 요건 정의 (What)
    *   **내용:** 사용자/권한, 투자관리, 기준정보 엔티티 및 제약조건
2.  **[DATA_ARCH_개체관계도_ERD.md](./DATA_ARCH_개체관계도_ERD.md)**
    *   **목적:** 테이블 간의 관계 시각화 (Relationship)
    *   **내용:** Mermaid 다이어그램을 통한 논리/물리 모델링
3.  **[DATA_ARCH_데이터명세서_DSD.md](./DATA_ARCH_데이터명세서_DSD.md)**
    *   **목적:** 실제 구현을 위한 물리적 스키마 명세 (How)
    *   **내용:** 테이블/컬럼 상세 정의 및 소스 매핑(Google Sheet ↔ DB)
4.  **[DATA_ARCH_매핑표준화설계.md](./DATA_ARCH_매핑표준화설계.md)**
    *   **목적:** 데이터 매핑 전략 및 표준화 방안
    *   **내용:** 이기종 데이터 소스 간 매핑 규칙

---

## 2. 분석 및 보고서 (DATA_REPORT)
현행 시스템 분석 결과를 담은 보고서입니다.

### 📋 주요 문서
1.  **[DATA_REPORT_구조분석보고서.md](./DATA_REPORT_구조분석보고서.md)** (구: 데이터_구조_검토_보고서)
    *   **목적:** 현행(AS-IS) 데이터 구조 분석 및 문제점 진단
    *   **내용:** Supabase-GoogleSheet 하이브리드 구조의 장단점 및 마이그레이션 제언

---

## 3. 개발 및 운영 가이드 (DATA_GUIDE)
개발자가 참고해야 할 실질적인 구현 가이드입니다.

### 📋 주요 문서
1.  **[DATA_GUIDE_API캐싱.md](./DATA_GUIDE_API캐싱.md)**
    *   **목적:** 서버 사이드 성능 최적화 가이드
    *   **내용:** Google Sheets API 호출 캐싱 전략, Redis 확장 가이드, 메모리 관리 등

---

## 📅 문서화 현황 및 계획
*   [x] **DATA_PLAN_문서작성계획** (본 문서): 전체 로드맵 수립
*   [x] **DATA_REPORT_구조분석보고서**: 현행 분석 완료
*   [x] **DATA_ARCH_요구사항정의서_DRD**: 요건 정의 완료
*   [x] **DATA_ARCH_개체관계도_ERD**: 모델링 완료
*   [x] **DATA_ARCH_데이터명세서_DSD**: 상세 설계 완료
*   [x] **DATA_GUIDE_API캐싱**: 구현 가이드 완료

**Next Step:**
1.  제안된 **DSD**를 바탕으로 Supabase DB 스키마 실제 생성 (DDL Script 작성)
2.  Google Sheets 데이터를 DB로 마이그레이션하는 스크립트 작성
