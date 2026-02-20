import { useState, useEffect, useCallback } from 'react';
import { MAPPING_RULES } from '../config/mapping_rules';
import { getApiUrl } from '../utils/apiConfig';

/**
 * 데이터 매핑 처리를 위한 커스텀 훅
 * @param {string} viewId - 매핑 규칙을 적용할 화면 ID (예: 'ACCOUNTS_MANAGER')
 * @returns {object} - { loading, error, getMappedValue, refDataMap, reloadRefData }
 */
export const useDataMapper = (viewId) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refDataMap, setRefDataMap] = useState({}); // { ruleKey: { refKey: displayValue } }
    const [rawRefData, setRawRefData] = useState({}); // { ruleKey: [originalRows] } (Dropdown용)

    const rules = MAPPING_RULES[viewId] || [];

    // 환경 변수 및 설정 (로컬 스토리지 등에서 가져옴)
    const sheetId = localStorage.getItem('sheet_id') || import.meta.env.VITE_DATA_SHEET_ID || '';
    const clientEmail = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
    const privateKey = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';

    // 참조 데이터 로드
    const loadReferenceData = useCallback(async () => {
        if (!rules || rules.length === 0) return;
        if (!sheetId || !clientEmail || !privateKey) return;

        setLoading(true);
        setError(null);

        const newRefDataMap = {};
        const newRawRefData = {};

        try {
            const apiUrl = getApiUrl('data');

            // 각 규칙별로 참조 시트 데이터 로드
            await Promise.all(rules.map(async (rule) => {
                const { targetColumn, mapping } = rule;
                const { refSheet, refKey, displayColumn, filters } = mapping;

                // 이미 로드된 시트가 있으면 재사용 가능하지만, 
                // 필터 조건이 다를 수 있으므로 규칙별로 별도 요청 (최적화 가능)
                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sheetId,
                            clientEmail,
                            privateKey,
                            sheetName: refSheet
                        }),
                    });

                    if (!response.ok) throw new Error(`Failed to load ${refSheet}`);
                    const result = await response.json();

                    if (result.data && Array.isArray(result.data)) {
                        let filteredData = result.data;

                        // 필터 적용
                        if (filters) {
                            filteredData = filteredData.filter(item => {
                                return Object.entries(filters).every(([k, v]) => item[k] === v);
                            });
                        }

                        // 정렬 (order 컬럼이 있다면)
                        filteredData.sort((a, b) => Number(a.order || 999) - Number(b.order || 999));

                        // 1. Raw Data 저장 (Dropdown 등에 사용)
                        newRawRefData[targetColumn] = filteredData;

                        // 2. Map 생성 (빠른 조회용)
                        const dataMap = {};
                        filteredData.forEach(row => {
                            const key = row[refKey];     // 예: code_id
                            const val = row[displayColumn]; // 예: code_name
                            if (key) dataMap[key] = val;
                        });
                        newRefDataMap[targetColumn] = dataMap;
                    }

                } catch (err) {
                    console.error(`Error loading ref sheet ${refSheet} for rule ${targetColumn}:`, err);
                }
            }));

            setRefDataMap(newRefDataMap);
            setRawRefData(newRawRefData);

        } catch (err) {
            console.error("useDataMapper Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [viewId, sheetId, clientEmail, privateKey]);

    // 초기 로드
    useEffect(() => {
        loadReferenceData();
    }, [loadReferenceData]);

    // 변환 함수 (값 -> 표시값)
    const getMappedValue = useCallback((targetColumn, originalValue) => {
        // 규칙이 없는 컬럼이면 원본 반환
        if (!refDataMap[targetColumn]) return originalValue;

        // 매핑된 값이 있으면 반환, 없으면 원본 반환 (혹은 '-'?)
        return refDataMap[targetColumn][originalValue] || originalValue;
    }, [refDataMap]);

    // Dropdown용 옵션 목록 가져오기
    const getReferenceOptions = useCallback((targetColumn) => {
        return rawRefData[targetColumn] || [];
    }, [rawRefData]);

    return {
        loading,
        error,
        getMappedValue,
        getReferenceOptions,
        reloadRefData: loadReferenceData
    };
};
