import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from './LanguageContext';
import { getApiUrl } from './utils/apiConfig';

import { Plus, Trash2, Save, Edit, Folder, Tag, AlertCircle, RefreshCw, X, Search } from 'lucide-react';

const CodeManagementTab = () => {
    const { t } = useLanguage();

    // 상태 관리
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);

    // 편집 상태
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // 검색어 상태 분리
    const [groupSearchKeyword, setGroupSearchKeyword] = useState(''); // 그룹 검색 (상단)
    const [codeSearchKeyword, setCodeSearchKeyword] = useState('');   // 하위 코드 검색 (우측)

    // 신규 코드 추가 폼 (우측 패널)
    const [newCodeForm, setNewCodeForm] = useState({ code_id: '', code_name: '', order: '', description: '', use_yn: 'Y' });

    // 환경 변수 설정
    const sheetId = localStorage.getItem('sheet_id') || import.meta.env.VITE_DATA_SHEET_ID || '';
    const clientEmail = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
    const privateKey = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';

    // 데이터 로드
    const loadCodes = async () => {
        if (!sheetId || !clientEmail || !privateKey) {
            setError('구글 시트 연동 설정이 필요합니다.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const apiUrl = getApiUrl('data');

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sheetId,
                    clientEmail,
                    privateKey,
                    sheetName: 'CODES'
                }),
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                throw new Error(`서버 응답 오류 (JSON 파싱 실패): ${text.substring(0, 100)}...`);
            }

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('CODES 시트가 존재하지 않습니다.');
                }
                const errorMsg = result.details ? `${result.error} (${result.details})` : (result.error || result.message || '데이터 로드 실패');
                throw new Error(errorMsg);
            }

            if (!result.data || !Array.isArray(result.data)) {
                // 데이터가 없을 때 빈 배열로 처리 (에러 아님)
                if (result.data === undefined) {
                    setCodes([]);
                    return;
                }
                throw new Error('데이터 형식이 올바르지 않습니다.');
            }

            // order 기준 정렬
            const sortedData = result.data.sort((a, b) => Number(a.order || 999) - Number(b.order || 999));
            setCodes(sortedData);
        } catch (err) {
            console.error('📊 [CodeManagementTab] loadCodes Error:', err);
            console.log('📊 [CodeManagementTab] Using Sheet ID:', sheetId);
            setError(err.message);
            setCodes([]); // 에러 시 빈 배열
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCodes();
    }, []);

    // TOP 그룹 정의
    const TOP_GROUP = { uuid: 'TOP', code_name: 'TOP', code_id: 'ROOT' };

    // 1. 실제 그룹 목록 (DB에 저장된 ROOT 코드들)
    const realGroupList = useMemo(() => {
        return codes.filter(c => c.group_code === 'ROOT');
    }, [codes]);

    // 2. [좌측] 필터링된 그룹 목록 (그룹 검색어 적용)
    const filteredGroupList = useMemo(() => {
        if (!groupSearchKeyword.trim()) return realGroupList;
        const lowerKey = groupSearchKeyword.toLowerCase();
        return realGroupList.filter(g =>
            g.code_name.toLowerCase().includes(lowerKey) ||
            g.code_id.toLowerCase().includes(lowerKey)
        );
    }, [realGroupList, groupSearchKeyword]);


    // 초기 로드 시 TOP 선택
    useEffect(() => {
        if (!selectedGroup) {
            setSelectedGroup(TOP_GROUP);
        }
    }, [selectedGroup]);

    // 그룹 변경 시 하위 코드 검색어 초기화
    useEffect(() => {
        setCodeSearchKeyword('');
    }, [selectedGroup]);


    // 3. [우측] 상세 목록 (선택된 그룹 + 하위 코드 검색어 적용)
    const detailList = useMemo(() => {
        if (!selectedGroup) return [];

        let targetCodes = [];

        // TOP 선택 시 -> 그룹 목록(ROOT) 자체를 보여줌
        if (selectedGroup.uuid === 'TOP') {
            targetCodes = realGroupList;
        } else {
            // 특정 그룹 선택 시 -> 해당 그룹의 하위 코드
            targetCodes = codes.filter(c => c.group_code === selectedGroup.code_id);
        }

        // 하위 코드 검색 필터링 (Local Search)
        if (codeSearchKeyword.trim()) {
            const lowerKey = codeSearchKeyword.toLowerCase();
            targetCodes = targetCodes.filter(c =>
                (c.code_name && c.code_name.toLowerCase().includes(lowerKey)) ||
                (c.code_id && c.code_id.toLowerCase().includes(lowerKey)) ||
                (c.description && c.description.toLowerCase().includes(lowerKey))
            );
        }

        // 정렬
        return targetCodes.sort((a, b) => {
            const orderA = a.order ? parseInt(a.order) : 9999;
            const orderB = b.order ? parseInt(b.order) : 9999;
            return orderA - orderB || a.code_name.localeCompare(b.code_name);
        });
    }, [codes, selectedGroup, realGroupList, codeSearchKeyword]);

    // --- CRUD 핸들러 ---

    // 추가 (현재 우측 패널의 컨텍스트에 따라)
    const handleAdd = async () => {
        // 유효성 검사
        if (!newCodeForm.code_id || !newCodeForm.code_name) {
            alert('코드ID와 코드명은 필수입니다.');
            return;
        }

        // TOP 선택 상태면 'ROOT' 그룹에 추가(즉, 새 그룹 생성), 아니면 선택된 그룹에 추가
        const targetGroupCode = selectedGroup.uuid === 'TOP' ? 'ROOT' : selectedGroup.code_id;

        const newItem = {
            ...newCodeForm,
            group_code: targetGroupCode,
            use_yn: newCodeForm.use_yn || 'Y',
            order: newCodeForm.order || detailList.length + 1
        };

        try {
            const apiUrl = getApiUrl('add');

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sheetId,
                    clientEmail,
                    privateKey,
                    sheetName: 'CODES',
                    item: newItem
                }),
            });

            if (!response.ok) throw new Error('추가 실패');

            const resData = await response.json();

            // 로컬 상태 업데이트
            setCodes(prev => [...prev, { ...newItem, uuid: resData.id }]);

            // 폼 초기화
            setNewCodeForm({ code_id: '', code_name: '', order: '', description: '', use_yn: 'Y' });
            // alert('추가되었습니다.'); // UX를 위해 alert 제거
        } catch (err) {
            alert(err.message);
        }
    };

    // 수정 시작
    const startEdit = (item) => {
        setEditingId(item.uuid);
        setEditForm({ ...item });
    };

    // 수정 저장
    const handleUpdate = async () => {
        try {
            const apiUrl = getApiUrl('update');

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sheetId,
                    clientEmail,
                    privateKey,
                    sheetName: 'CODES',
                    uuid: editingId,
                    item: editForm
                }),
            });

            if (!response.ok) throw new Error('수정 실패');

            // 로컬 업데이트
            setCodes(prev => prev.map(c => (c.uuid === editingId ? { ...editForm } : c)));
            setEditingId(null);
            setEditForm({});
            alert('수정되었습니다.');
        } catch (err) {
            alert(err.message);
        }
    };

    // 삭제
    const handleDelete = async (item) => {
        // 그룹 삭제 시 하위 코드 존재 여부 체크
        if (item.group_code === 'ROOT') {
            const children = codes.filter(c => c.group_code === item.code_id);
            if (children.length > 0) {
                alert(`하위 코드(${children.length}건)가 존재하여 삭제할 수 없습니다.\n먼저 하위 코드를 모두 삭제해주세요.`);
                return;
            }
        }

        if (!confirm(`정말 삭제하시겠습니까? (${item.code_name})`)) return;

        try {
            const apiUrl = getApiUrl('delete');

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sheetId,
                    clientEmail,
                    privateKey,
                    sheetName: 'CODES',
                    uuid: item.uuid
                }),
            });

            if (!response.ok) throw new Error('삭제 실패');

            // 로컬 업데이트
            setCodes(prev => prev.filter(c => c.uuid !== item.uuid));
            // 만약 삭제된 그룹이 선택된 상태였다면 TOP으로 이동
            if (selectedGroup && selectedGroup.uuid === item.uuid) {
                setSelectedGroup(TOP_GROUP);
            }
            alert('삭제되었습니다.');
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* 상단: 그룹 검색 (Top Bar) */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex-none">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Folder size={18} /> 그룹코드 검색
                    </span>

                    {/* 그룹 검색창 */}
                    <div className="relative flex-grow max-w-lg">
                        <input
                            type="text"
                            value={groupSearchKeyword}
                            onChange={(e) => setGroupSearchKeyword(e.target.value)}
                            placeholder="찾고 싶은 그룹명 또는 그룹ID 입력..."
                            className="w-full p-2.5 pl-10 pr-10 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-[var(--text-main)] focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        {groupSearchKeyword && (
                            <button
                                onClick={() => setGroupSearchKeyword('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="ml-auto text-sm text-gray-500">
                        <span> 전체 그룹: <span className="font-bold">{realGroupList.length}</span> 개</span>
                    </div>
                </div>
            </div>

            {/* 메인 컨텐츠 (좌우 스플릿) - 꽉 찬 높이 */}
            <div className="flex flex-1 gap-6 min-h-0">

                {/* [좌측] 그룹 목록 카드 */}
                <div className="w-1/4 min-w-[250px] bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <h2 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <Folder size={18} className="text-[var(--primary)]" /> 그룹 목록
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {/* TOP 항목 */}
                        {!groupSearchKeyword && (
                            <>
                                <div
                                    onClick={() => setSelectedGroup(TOP_GROUP)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group
                                        ${selectedGroup?.uuid === 'TOP'
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 shadow-sm'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${selectedGroup?.uuid === 'TOP' ? 'bg-white dark:bg-indigo-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                            <Folder size={16} className={selectedGroup?.uuid === 'TOP' ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-500'} />
                                        </div>
                                        <span className="font-semibold text-sm">TOP (그룹 관리)</span>
                                    </div>
                                </div>
                                <div className="my-2 border-t border-gray-100 dark:border-gray-700 mx-2"></div>
                            </>
                        )}

                        {filteredGroupList.length === 0 && groupSearchKeyword ? (
                            <div className="p-4 text-center text-gray-400 text-sm">검색된 그룹이 없습니다.</div>
                        ) : (
                            filteredGroupList.map(group => (
                                <div
                                    key={group.uuid}
                                    onClick={() => setSelectedGroup(group)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group
                                        ${selectedGroup?.uuid === group.uuid
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 shadow-sm'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`p-2 rounded-lg flex-shrink-0 ${selectedGroup?.uuid === group.uuid ? 'bg-white dark:bg-indigo-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                            <Tag size={16} className={selectedGroup?.uuid === group.uuid ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-500'} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-sm truncate">{group.code_name}</div>
                                            <div className="text-xs opacity-70 font-mono truncate">{group.code_id}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* [우측] 상세 코드 목록 카드 */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
                    {/* 우측 헤더 */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                                <Tag size={18} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800 dark:text-white text-lg flex items-center gap-2">
                                    {selectedGroup ? selectedGroup.code_name : '그룹 선택'}
                                </h2>
                                {selectedGroup && (
                                    <p className="text-xs text-gray-500 font-mono">{selectedGroup.code_id === 'ROOT' ? '최상위 그룹 코드 관리' : `그룹 ID: ${selectedGroup.code_id}`}</p>
                                )}
                            </div>
                        </div>

                        {/* 하위 코드 검색창 (Local Search) */}
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                value={codeSearchKeyword}
                                onChange={(e) => setCodeSearchKeyword(e.target.value)}
                                placeholder="하위 코드 검색..."
                                className="w-full p-2 pl-9 pr-8 text-xs md:text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
                            />
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            {codeSearchKeyword && (
                                <button
                                    onClick={() => setCodeSearchKeyword('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 테이블 영역 */}
                    <div className="flex-1 overflow-auto p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                                <RefreshCw className="animate-spin text-indigo-500" size={32} />
                                <p className="text-sm">코드를 불러오는 중입니다...</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10 shadow-sm">
                                    <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase border-b border-gray-100 dark:border-gray-700">
                                        <th className="p-3 font-semibold text-center w-16">No</th>
                                        <th className="p-3 font-semibold min-w-[120px]">코드ID (Key)</th>
                                        <th className="p-3 font-semibold min-w-[150px]">코드명 (Value)</th>
                                        <th className="p-3 font-semibold text-center w-20">정렬</th>
                                        <th className="p-3 font-semibold w-1/4">설명</th>
                                        <th className="p-3 font-semibold text-center w-20">사용</th>
                                        <th className="p-3 font-semibold text-center w-20">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {detailList.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="p-12 text-center text-gray-400">
                                                {codeSearchKeyword ? '검색 결과가 없습니다.' : '등록된 코드가 없습니다.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        detailList.map((item, idx) => {
                                            const isEditing = editingId === item.uuid;
                                            return (
                                                <tr key={item.uuid} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                                                    <td className="p-4 text-center text-gray-400 text-xs">{idx + 1}</td>

                                                    {/* 코드ID */}
                                                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-white font-mono">
                                                        {item.code_id}
                                                    </td>

                                                    {/* 코드명 (수정 모드) */}
                                                    <td className="p-4">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                className="w-full p-2 text-sm border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
                                                                value={editForm.code_name || ''}
                                                                onChange={e => setEditForm({ ...editForm, code_name: e.target.value })}
                                                            />
                                                        ) : (
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">{item.code_name}</span>
                                                        )}
                                                    </td>

                                                    {/* 정렬 순서 */}
                                                    <td className="p-4 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                className="w-full p-2 text-sm border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 text-center bg-white dark:bg-gray-700 dark:text-white"
                                                                value={editForm.order || ''}
                                                                onChange={e => setEditForm({ ...editForm, order: e.target.value })}
                                                            />
                                                        ) : (
                                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">{item.order}</span>
                                                        )}
                                                    </td>

                                                    {/* 설명 */}
                                                    <td className="p-4">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                className="w-full p-2 text-sm border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white"
                                                                value={editForm.description || ''}
                                                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                            />
                                                        ) : (
                                                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate block max-w-[200px]">{item.description}</span>
                                                        )}
                                                    </td>

                                                    {/* 사용 여부 */}
                                                    <td className="p-4 text-center">
                                                        {isEditing ? (
                                                            <select
                                                                value={editForm.use_yn || 'Y'}
                                                                onChange={e => setEditForm({ ...editForm, use_yn: e.target.value })}
                                                                className="p-1 border rounded text-xs bg-white dark:bg-gray-700 dark:text-white"
                                                            >
                                                                <option value="Y">Y</option>
                                                                <option value="N">N</option>
                                                            </select>
                                                        ) : (
                                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.use_yn === 'N'
                                                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                                : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                                }`}>
                                                                {item.use_yn || 'Y'}
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* 관리 버튼 */}
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {isEditing ? (
                                                                <>
                                                                    <button onClick={() => handleUpdate()} className="p-1.5 text-green-600 hover:bg-green-50 rounded dark:hover:bg-green-900/20" title="저장">
                                                                        <Save size={16} />
                                                                    </button>
                                                                    <button onClick={() => { setEditingId(null); setEditForm({}); }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded dark:hover:bg-gray-700" title="취소">
                                                                        <X size={16} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => startEdit(item)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded dark:hover:bg-indigo-900/20" title="수정">
                                                                        <Edit size={16} />
                                                                    </button>
                                                                    <button onClick={() => handleDelete(item)} className="p-1.5 text-red-500 hover:bg-red-50 rounded dark:hover:bg-red-900/20" title="삭제">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}

                                    {/* --- 신규 추가 행 (코드 검색 중이 아닐 때만 표시) -- */}
                                    {!codeSearchKeyword && (
                                        <tr className="bg-indigo-50/50 dark:bg-indigo-900/10 border-t-2 border-indigo-100 dark:border-indigo-800">
                                            <td className="p-3 text-center text-indigo-400"><Plus size={16} className="mx-auto" /></td>
                                            <td className="p-3">
                                                <input
                                                    type="text"
                                                    placeholder="코드ID (영어)"
                                                    className="w-full p-2 text-sm border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                                    value={newCodeForm.code_id}
                                                    onChange={e => setNewCodeForm(prev => ({ ...prev, code_id: e.target.value.toUpperCase() }))}
                                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="text"
                                                    placeholder="코드명 (한글)"
                                                    className="w-full p-2 text-sm border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                                    value={newCodeForm.code_name}
                                                    onChange={e => setNewCodeForm(prev => ({ ...prev, code_name: e.target.value }))}
                                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder={detailList.length + 1}
                                                    className="w-full p-2 text-sm border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 bg-white text-center text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                                    value={newCodeForm.order}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        if (val === '' || parseInt(val) > 0) {
                                                            setNewCodeForm(prev => ({ ...prev, order: val }));
                                                        }
                                                    }}
                                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="text"
                                                    placeholder="설명 (선택)"
                                                    className="w-full p-2 text-sm border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                                    value={newCodeForm.description}
                                                    onChange={e => setNewCodeForm(prev => ({ ...prev, description: e.target.value }))}
                                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                                />
                                            </td>
                                            <td className="p-3 text-center">
                                                <select
                                                    value={newCodeForm.use_yn}
                                                    onChange={e => setNewCodeForm(prev => ({ ...prev, use_yn: e.target.value }))}
                                                    className="p-1 border rounded text-xs bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center"
                                                >
                                                    <option value="Y">Y</option>
                                                    <option value="N">N</option>
                                                </select>
                                            </td>
                                            <td className="p-3 text-center">
                                                <button
                                                    onClick={() => handleAdd()}
                                                    className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow-sm transition-colors text-xs font-bold whitespace-nowrap"
                                                >
                                                    추가
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeManagementTab;
